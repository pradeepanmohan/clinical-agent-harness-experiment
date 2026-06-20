#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative } from 'node:path';

const args = parseArgs(process.argv.slice(2));
const outPath = args.out ?? '.harness/pr-walkthrough/index.html';
const prNumber = args.pr ?? process.env.PR_NUMBER ?? '';
const repo = args.repo ?? process.env.GITHUB_REPOSITORY ?? '';

const pr = loadPrContext({ prNumber, repo });
const data = buildWalkthroughData(pr);
const html = renderHtml(data);
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, html);
console.log(`Generated PR walkthrough: ${outPath}`);
console.log(`Graphs: ${data.graphs.length}; nodes: ${data.graphs.reduce((sum, graph) => sum + graph.nodes.length, 0)}; edges: ${data.graphs.reduce((sum, graph) => sum + graph.edges.length, 0)}`);

function parseArgs(values) {
  const parsed = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith('--')) continue;
    const key = value.slice(2);
    const next = values[index + 1];
    if (!next || next.startsWith('--')) {
      parsed[key] = 'true';
    } else {
      parsed[key] = next;
      index += 1;
    }
  }
  return parsed;
}

function loadPrContext({ prNumber, repo }) {
  if (prNumber && repo && commandExists('gh')) {
    try {
      const viewArgs = ['pr', 'view', prNumber, '--repo', repo, '--json', 'number,title,body,url,baseRefName,headRefName,files,comments,reviews'];
      const pr = JSON.parse(execFileSync('gh', viewArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
      const files = normalizeGhFiles(pr.files ?? []);
      return {
        source: 'github',
        number: pr.number,
        title: pr.title,
        body: pr.body ?? '',
        url: pr.url,
        baseRef: pr.baseRefName,
        headRef: pr.headRefName,
        files,
        comments: normalizeComments(pr.comments ?? [], pr.reviews ?? []),
      };
    } catch (error) {
      console.warn(`GitHub PR metadata unavailable, falling back to local git diff: ${error.message}`);
    }
  }

  return loadLocalDiffContext();
}

function commandExists(name) {
  try {
    execFileSync('bash', ['-lc', `command -v ${shellQuote(name)}`], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

function loadLocalDiffContext() {
  const baseRef = inferBaseRef();
  const title = currentBranch() === 'HEAD' ? 'Local PR walkthrough' : `Local PR walkthrough for ${currentBranch()}`;
  const diffRange = `${baseRef}...HEAD`;
  const nameStatus = safeGit(['diff', '--name-status', diffRange]);
  const files = nameStatus
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [status, ...rest] = line.split(/\s+/);
      const path = rest.at(-1) ?? status;
      return { path, status, additions: 0, deletions: 0, changes: 0 };
    });

  return {
    source: 'local',
    number: null,
    title,
    body: 'Generated from the local git diff because GitHub PR metadata was not provided.',
    url: '',
    baseRef,
    headRef: currentBranch(),
    files,
    comments: [],
  };
}

function inferBaseRef() {
  const candidates = ['origin/main', 'main', 'origin/master', 'master'];
  for (const candidate of candidates) {
    if (safeGit(['rev-parse', '--verify', candidate])) return candidate;
  }
  return 'HEAD~1';
}

function currentBranch() {
  return safeGit(['branch', '--show-current']).trim() || 'HEAD';
}

function safeGit(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return '';
  }
}

function normalizeGhFiles(files) {
  return files.map((file) => ({
    path: file.path,
    status: file.status ?? 'modified',
    additions: Number(file.additions ?? 0),
    deletions: Number(file.deletions ?? 0),
    changes: Number(file.additions ?? 0) + Number(file.deletions ?? 0),
  }));
}

function normalizeComments(comments, reviews) {
  const issueComments = comments.map((comment) => ({
    author: comment.author?.login ?? 'commenter',
    body: firstSentence(comment.body ?? '').slice(0, 220),
    url: comment.url ?? '',
  }));
  const reviewComments = reviews
    .filter((review) => review.body || review.state)
    .map((review) => ({
      author: review.author?.login ?? 'reviewer',
      body: `${review.state ?? 'review'}${review.body ? `: ${firstSentence(review.body)}` : ''}`.slice(0, 220),
      url: review.url ?? '',
    }));
  return [...issueComments, ...reviewComments].filter((comment) => comment.body.trim());
}

function firstSentence(value) {
  return String(value).replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/)[0] ?? '';
}

function buildWalkthroughData(pr) {
  const files = pr.files.length ? pr.files : [{ path: 'No changed files detected', status: 'unknown', additions: 0, deletions: 0, changes: 0 }];
  const groups = groupFiles(files);
  const largestFiles = [...files].sort((a, b) => b.changes - a.changes).slice(0, 6);
  const entryFiles = files.filter((file) => /(^apps\/|^packages\/|^scripts\/|^\.github\/workflows\/|^\.harness\/)/.test(file.path)).slice(0, 6);
  const testFiles = files.filter((file) => /(?:test|spec)\.[cm]?[tj]sx?$|__tests__|\.test\./.test(file.path)).slice(0, 5);
  const docsFiles = files.filter((file) => /(^docs\/|README|\.md$|\.mdx$)/i.test(file.path)).slice(0, 5);

  return {
    meta: {
      title: pr.title,
      prUrl: pr.url,
      baseRef: pr.baseRef,
      headRef: pr.headRef,
      summary: summarizeIntent(pr, groups),
      generatedAt: new Date().toISOString(),
      source: pr.source,
    },
    graphs: [
      systemOverviewGraph(groups, pr),
      dataFlowGraph({ groups, largestFiles, docsFiles, pr }),
      dependencyGraph({ groups, entryFiles, testFiles, pr }),
      userActionGraph({ groups, entryFiles, docsFiles, pr }),
    ],
  };
}

function groupFiles(files) {
  const map = new Map();
  for (const file of files) {
    const top = file.path.includes('/') ? file.path.split('/')[0] : 'root';
    const current = map.get(top) ?? { id: slug(top), name: top, files: [], changes: 0, additions: 0, deletions: 0 };
    current.files.push(file);
    current.changes += file.changes;
    current.additions += file.additions;
    current.deletions += file.deletions;
    map.set(top, current);
  }
  return [...map.values()].sort((a, b) => b.changes - a.changes || a.name.localeCompare(b.name)).slice(0, 8);
}

function summarizeIntent(pr, groups) {
  const bodyLine = firstSentence(pr.body || '').slice(0, 160);
  const touched = groups.map((group) => group.name).join(', ');
  return bodyLine || `This change touches ${touched || 'the repository'} and needs reviewer orientation before human merge.`;
}

function systemOverviewGraph(groups, pr) {
  const nodes = groups.slice(0, 5).map((group, index) => ({
    id: `area-${group.id}`,
    title: displayAreaName(group.name),
    kind: 'stable area',
    x: (index % 2) * 420,
    y: Math.floor(index / 2) * 250,
    width: 360,
    height: 210,
    summary: `${group.files.length} changed file${group.files.length === 1 ? '' : 's'} under ${group.name}. Use this as the architectural entry point for this part of the review.`,
    details: group.files.slice(0, 5).map((file) => `${file.path} (${file.status}, +${file.additions}/-${file.deletions})`),
    files: group.files.slice(0, 5).map(fileLink(pr, 'Area file')),
    comments: [],
    links: pr.url ? [{ label: 'Pull request', url: pr.url }] : [],
  }));

  if (!nodes.length) nodes.push(emptyNode('no-files', 'No changed files detected', 0, 0));
  return {
    id: 'system-overview',
    label: 'System overview',
    color: '#c0872a',
    summary: 'Stable map of the repository areas touched by the change.',
    nodes,
    edges: [],
    tour: nodes.map((node) => ({ nodeId: node.id, title: node.title, body: `Start review orientation here: ${node.summary}` })),
  };
}

function dataFlowGraph({ groups, largestFiles, docsFiles, pr }) {
  const nodes = [
    node('intent', 'Intent and constraints', 'intent', -360, 0, summarizeIntent(pr, groups), docsFiles, pr, pr.comments),
    node('inputs', 'Changed inputs', 'source', 0, 0, changedSummary(largestFiles), largestFiles, pr),
    node('processing', 'Implementation path', 'processing', 360, 0, groupSummary(groups), largestFiles, pr),
    node('outputs', 'Reviewer output', 'output', 720, 0, 'The reviewer gets a focused set of files, areas, tests, and discussion points instead of reconstructing the session from raw diff alone.', largestFiles, pr),
  ];
  return graph('data-flow', 'Data flow graph', '#34895c', 'How PR intent and changed files flow into reviewer understanding.', nodes, [
    edge('intent', 'inputs', 'frames'),
    edge('inputs', 'processing', 'feed'),
    edge('processing', 'outputs', 'produce'),
  ]);
}

function dependencyGraph({ groups, entryFiles, testFiles, pr }) {
  const areaNodes = groups.slice(0, 4).map((group, index) => node(`dep-${group.id}`, displayAreaName(group.name), 'area', index * 280, 150, `${group.files.length} file${group.files.length === 1 ? '' : 's'} changed here.`, group.files, pr));
  const nodes = [
    node('entrypoints', 'Entrypoints', 'entry', -300, -80, entryFiles.length ? 'Files likely to be public surfaces, workflow entrypoints, scripts, apps, or packages.' : 'No obvious app/package/workflow entrypoints detected.', entryFiles, pr),
    ...areaNodes,
    node('tests', 'Verification surface', 'tests', areaNodes.length * 280, -80, testFiles.length ? 'Changed tests/specs attached to this PR.' : 'No changed test files detected; reviewers should check whether existing verification covers the changed areas.', testFiles, pr),
  ];
  const edges = areaNodes.map((area) => edge('entrypoints', area.id, 'routes into'));
  edges.push(...areaNodes.map((area) => edge(area.id, 'tests', 'should be covered by')));
  return graph('code-dependency', 'Code dependency graph', '#2e5d9e', 'Reviewer-oriented dependency map from entrypoints to changed areas to tests.', nodes, edges);
}

function userActionGraph({ groups, entryFiles, docsFiles, pr }) {
  const nodes = [
    node('open-pr', 'Open PR', 'user action', -360, 0, 'Reviewer starts from the PR conversation and summary.', [], pr, pr.comments),
    node('read-intent', 'Read intent', 'review step', 0, 0, summarizeIntent(pr, groups), docsFiles, pr),
    node('inspect-map', 'Inspect changed areas', 'review step', 360, 0, groupSummary(groups), entryFiles, pr),
    node('verify-evidence', 'Check evidence', 'review step', 720, 0, 'Reviewer compares changed files against verification output, comments, and merge policy before approving.', entryFiles, pr),
  ];
  return graph('user-action', 'User action graph', '#754dac', 'Step-by-step reviewer path for using the PR walkthrough.', nodes, [
    edge('open-pr', 'read-intent', 'then'),
    edge('read-intent', 'inspect-map', 'then'),
    edge('inspect-map', 'verify-evidence', 'then'),
  ]);
}

function graph(id, label, color, summary, nodes, edges) {
  return {
    id,
    label,
    color,
    summary,
    nodes,
    edges: edges.map((item, index) => ({ id: `${id}-edge-${index + 1}`, ...item })),
    tour: nodes.map((item, index) => ({ nodeId: item.id, title: `${index + 1}. ${item.title}`, body: item.summary })),
  };
}

function node(id, title, kind, x, y, summary, files, pr, comments = []) {
  return {
    id,
    title,
    kind,
    x,
    y,
    summary,
    details: files?.length ? files.slice(0, 5).map((file) => `${file.path} (${file.status}, +${file.additions}/-${file.deletions})`) : ['No direct file attachment for this step.'],
    files: (files ?? []).slice(0, 8).map(fileLink(pr, kind)),
    comments,
    links: pr.url ? [{ label: 'Pull request', url: pr.url }] : [],
  };
}

function emptyNode(id, title, x, y) {
  return { id, title, kind: 'empty', x, y, summary: title, details: [title], files: [], comments: [], links: [] };
}

function edge(source, target, label) {
  return { source, target, label };
}

function fileLink(pr, note) {
  return (file) => ({
    path: file.path,
    note,
    url: pr.url ? `${pr.url}/files` : '',
  });
}

function groupSummary(groups) {
  if (!groups.length) return 'No changed repository areas were detected.';
  return groups.map((group) => `${displayAreaName(group.name)}: ${group.files.length} file${group.files.length === 1 ? '' : 's'}`).join('; ');
}

function changedSummary(files) {
  if (!files.length) return 'No changed files detected.';
  return files.map((file) => `${file.path} (+${file.additions}/-${file.deletions})`).join('; ');
}

function displayAreaName(name) {
  const labels = {
    apps: 'Applications',
    packages: 'Packages',
    docs: 'Documentation',
    scripts: 'Scripts',
    '.github': 'GitHub automation',
    '.harness': 'Harness state',
    '.sandcastle': 'Sandcastle runner',
    root: 'Repository root',
  };
  return labels[name] ?? name;
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'area';
}

function renderHtml(data) {
  const json = JSON.stringify(data).replace(/<\//g, '<\\/');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(data.meta.title)} · PR Walkthrough</title>
  <script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"></script>
  <style>
    :root { color-scheme: dark; --bg:#101214; --panel:#171b20; --panel2:#202630; --text:#f5f7fb; --muted:#aab4c0; --line:#344050; --accent:#7c5cff; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: radial-gradient(circle at 20% 10%, #274a7a55, transparent 24rem), var(--bg); color: var(--text); font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    a { color: #9fc5ff; }
    header { padding: 28px 32px 20px; border-bottom: 1px solid var(--line); background: #11161dcc; position: sticky; top: 0; z-index: 2; backdrop-filter: blur(12px); }
    h1 { margin: 0 0 8px; font-size: clamp(28px, 4vw, 56px); letter-spacing: -0.04em; }
    .meta, .summary { color: var(--muted); max-width: 1100px; }
    .meta { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; display: flex; flex-wrap: wrap; gap: 10px; }
    main { display: grid; grid-template-columns: 300px 1fr 360px; min-height: calc(100vh - 150px); }
    aside { padding: 16px; background: var(--panel); border-right: 1px solid var(--line); overflow: auto; }
    aside.right { border-left: 1px solid var(--line); border-right: 0; }
    button, input { width: 100%; border: 1px solid var(--line); border-radius: 10px; background: var(--panel2); color: var(--text); padding: 10px 12px; text-align: left; font: inherit; }
    button { cursor: pointer; margin-bottom: 8px; }
    button[aria-pressed="true"] { border-color: var(--graph-color); box-shadow: inset 4px 0 0 var(--graph-color); }
    input { margin: 8px 0 16px; }
    .tour { border: 1px solid var(--line); border-radius: 14px; padding: 12px; background: #101419; margin-bottom: 12px; }
    .tour small, .panel-title { color: var(--muted); font: 11px ui-monospace, SFMono-Regular, Menlo, monospace; text-transform: uppercase; letter-spacing: .08em; }
    .tour h2, .details h2 { margin: 8px 0; }
    .tour p, .details p, li { color: var(--muted); line-height: 1.45; }
    .stage { min-width: 0; min-height: 720px; position: relative; }
    svg { width: 100%; height: 100%; min-height: 720px; display: block; }
    .edge path { fill: none; stroke: #8390a5; stroke-width: 2; stroke-opacity: .75; }
    .edge text { fill: #c8d2df; font: 11px ui-monospace, SFMono-Regular, Menlo, monospace; paint-order: stroke; stroke: var(--bg); stroke-width: 4px; }
    .node rect { fill: #18202a; stroke: var(--node-color); stroke-width: 2; filter: drop-shadow(0 10px 24px #0008); }
    .node { cursor: pointer; }
    .node.is-selected rect, .node.is-tour-node rect { stroke: #fff; stroke-width: 4; }
    .node.is-dimmed, .edge.is-dimmed { opacity: .18; }
    .node-title { fill: var(--text); font-weight: 800; font-size: 15px; pointer-events: none; }
    .node-kind { fill: var(--muted); font: 10px ui-monospace, SFMono-Regular, Menlo, monospace; text-transform: uppercase; letter-spacing: .08em; pointer-events: none; }
    .node-summary { fill: #c8d2df; font-size: 12px; pointer-events: none; }
    ul { padding-left: 18px; }
    @media (max-width: 1100px) { main { grid-template-columns: 1fr; } aside, aside.right { border: 0; border-bottom: 1px solid var(--line); max-height: 360px; } }
  </style>
</head>
<body>
  <header>
    <div class="meta"><span>PR Walkthrough</span><span>${escapeHtml(data.meta.baseRef)} → ${escapeHtml(data.meta.headRef)}</span><span>${escapeHtml(data.meta.generatedAt)}</span></div>
    <h1>${escapeHtml(data.meta.title)}</h1>
    <p class="summary">${escapeHtml(data.meta.summary)}</p>
  </header>
  <main>
    <aside>
      <p class="panel-title">Views</p>
      <div id="graph-buttons"></div>
      <p class="panel-title">Search</p>
      <input id="search" placeholder="Search nodes and files" />
      <div class="tour">
        <small id="tour-step">Step</small>
        <h2 id="tour-title"></h2>
        <p id="tour-body"></p>
      </div>
      <button data-action="prev">Previous tour step</button>
      <button data-action="next">Next tour step</button>
      <button data-action="restart">Restart tour</button>
      <button data-action="fit">Fit to view</button>
      <button data-action="reset">Reset zoom</button>
    </aside>
    <section class="stage"><svg id="canvas" role="img" aria-label="Interactive PR walkthrough"></svg></section>
    <aside class="right"><div id="details" class="details"></div></aside>
  </main>
  <script id="pr-walkthrough-data" type="application/json">${json}</script>
  <script>
    const data = JSON.parse(document.getElementById('pr-walkthrough-data').textContent);
    window.PR_WALKTHROUGH_D3_DATA = data;
    const svg = d3.select('#canvas');
    const viewport = svg.append('g');
    const zoom = d3.zoom().scaleExtent([0.25, 2.5]).on('zoom', (event) => viewport.attr('transform', event.transform));
    svg.call(zoom);
    let activeGraphId = data.graphs[0].id;
    let tourIndex = 0;
    let selectedNodeId = null;
    const graphButtons = d3.select('#graph-buttons');
    graphButtons.selectAll('button').data(data.graphs).join('button')
      .attr('data-graph-id', d => d.id)
      .style('--graph-color', d => d.color)
      .attr('aria-pressed', d => d.id === activeGraphId ? 'true' : 'false')
      .text(d => d.label)
      .on('click', (_, graph) => { activeGraphId = graph.id; tourIndex = 0; selectedNodeId = null; render(); });
    d3.select('#search').on('input', applyFilter);
    d3.selectAll('[data-action]').on('click', function() {
      const action = this.dataset.action;
      const graph = activeGraph();
      if (action === 'next') tourIndex = Math.min((graph.tour || []).length - 1, tourIndex + 1);
      if (action === 'prev') tourIndex = Math.max(0, tourIndex - 1);
      if (action === 'restart') tourIndex = 0;
      if (action === 'fit') fit();
      if (action === 'reset') svg.transition().duration(150).call(zoom.transform, d3.zoomIdentity);
      render();
    });
    window.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight' || event.key === 'n') document.querySelector('[data-action="next"]').click();
      if (event.key === 'ArrowLeft' || event.key === 'p') document.querySelector('[data-action="prev"]').click();
      if (['1','2','3','4'].includes(event.key)) { activeGraphId = data.graphs[Number(event.key) - 1].id; tourIndex = 0; render(); }
      if (event.key === '/') { event.preventDefault(); document.querySelector('#search').focus(); }
    });
    function activeGraph() { return data.graphs.find(graph => graph.id === activeGraphId) || data.graphs[0]; }
    function render() {
      const graph = activeGraph();
      graphButtons.selectAll('button').attr('aria-pressed', d => d.id === activeGraphId ? 'true' : 'false');
      viewport.selectAll('*').remove();
      const defs = svg.selectAll('defs').data([null]).join('defs');
      defs.selectAll('marker').data([graph]).join('marker')
        .attr('id', 'arrow').attr('viewBox', '0 -5 10 10').attr('refX', 10).attr('refY', 0).attr('markerWidth', 7).attr('markerHeight', 7).attr('orient', 'auto')
        .html('<path d="M0,-5L10,0L0,5" fill="#8390a5"></path>');
      const nodes = new Map(graph.nodes.map(node => [node.id, node]));
      const edges = viewport.append('g').selectAll('g').data(graph.edges || []).join('g').attr('class', 'edge');
      edges.append('path').attr('d', edgePath(nodes)).attr('marker-end', 'url(#arrow)');
      edges.append('text').append('textPath').attr('href', (_, i) => '#edge-path-' + i).attr('startOffset', '50%').attr('text-anchor', 'middle').text(d => d.label);
      edges.select('path').attr('id', (_, i) => 'edge-path-' + i);
      const node = viewport.append('g').selectAll('g').data(graph.nodes).join('g')
        .attr('class', 'node')
        .attr('data-node-id', d => d.id)
        .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')')
        .style('--node-color', graph.color)
        .on('click', (_, d) => { selectedNodeId = d.id; const idx = graph.tour.findIndex(step => step.nodeId === d.id); if (idx >= 0) tourIndex = idx; renderDetails(d); applyFilter(); renderTour(graph); });
      node.append('rect').attr('x', d => -width(d, graph)/2).attr('y', d => -height(d, graph)/2).attr('width', d => width(d, graph)).attr('height', d => height(d, graph)).attr('rx', 14);
      node.append('text').attr('class', 'node-kind').attr('x', d => -width(d, graph)/2 + 16).attr('y', d => -height(d, graph)/2 + 24).text(d => d.kind || 'node');
      node.append('text').attr('class', 'node-title').attr('x', d => -width(d, graph)/2 + 16).attr('y', d => -height(d, graph)/2 + 50).text(d => d.title);
      node.append('text').attr('class', 'node-summary').attr('x', d => -width(d, graph)/2 + 16).attr('y', d => -height(d, graph)/2 + 78).text(d => d.summary).call(wrapText, d => width(d, graph) - 32, d => graph.id === 'system-overview' ? 6 : 3);
      selectedNodeId = selectedNodeId || graph.tour[tourIndex]?.nodeId || graph.nodes[0]?.id;
      renderTour(graph);
      renderDetails(nodes.get(selectedNodeId) || graph.nodes[0]);
      applyFilter();
    }
    function renderTour(graph) {
      const step = graph.tour[tourIndex] || graph.tour[0];
      selectedNodeId = step?.nodeId || selectedNodeId;
      document.querySelector('#tour-step').textContent = 'Step ' + (tourIndex + 1) + ' / ' + graph.tour.length;
      document.querySelector('#tour-title').textContent = step?.title || graph.label;
      document.querySelector('#tour-body').textContent = step?.body || graph.summary;
    }
    function renderDetails(node) {
      if (!node) return;
      document.querySelector('#details').innerHTML = '<p class="panel-title">Selected point</p><h2>' + esc(node.title) + '</h2><p>' + esc(node.summary) + '</p><h3>Files</h3>' + list(node.files, f => '<a href="' + esc(f.url || '#') + '" target="_blank" rel="noreferrer">' + esc(f.path) + '</a><br><small>' + esc(f.note || '') + '</small>') + '<h3>Details</h3>' + list((node.details || []).map(d => ({ body: d })), d => esc(d.body)) + '<h3>Discussion</h3>' + list(node.comments || [], c => '<strong>' + esc(c.author) + '</strong>: ' + esc(c.body)) + '<h3>Links</h3>' + list(node.links || [], l => '<a href="' + esc(l.url) + '" target="_blank" rel="noreferrer">' + esc(l.label) + '</a>');
    }
    function list(items, renderItem) { return items && items.length ? '<ul>' + items.map(item => '<li>' + renderItem(item) + '</li>').join('') + '</ul>' : '<p>No items attached.</p>'; }
    function applyFilter() {
      const query = document.querySelector('#search').value.toLowerCase().trim();
      const graph = activeGraph();
      const tourNode = graph.tour[tourIndex]?.nodeId;
      d3.selectAll('.node').classed('is-dimmed', d => query && !JSON.stringify(d).toLowerCase().includes(query)).classed('is-selected', d => d.id === selectedNodeId).classed('is-tour-node', d => d.id === tourNode);
      d3.selectAll('.edge').classed('is-dimmed', d => query && !JSON.stringify(d).toLowerCase().includes(query));
    }
    function fit() {
      const box = viewport.node().getBBox();
      const fullWidth = svg.node().clientWidth || 1200;
      const fullHeight = svg.node().clientHeight || 720;
      const scale = Math.min(1.3, 0.82 / Math.max(box.width / fullWidth, box.height / fullHeight));
      const translate = [fullWidth / 2 - scale * (box.x + box.width / 2), fullHeight / 2 - scale * (box.y + box.height / 2)];
      svg.transition().duration(150).call(zoom.transform, d3.zoomIdentity.translate(...translate).scale(scale));
    }
    function edgePath(nodes) { return d => { const s = nodes.get(d.source); const t = nodes.get(d.target); if (!s || !t) return ''; return 'M' + s.x + ',' + s.y + ' C' + (s.x + 130) + ',' + s.y + ' ' + (t.x - 130) + ',' + t.y + ' ' + t.x + ',' + t.y; }; }
    function width(node, graph) { return Number(node.width || (graph.id === 'system-overview' ? 360 : 230)); }
    function height(node, graph) { return Number(node.height || (graph.id === 'system-overview' ? 210 : 120)); }
    function wrapText(text, widthFn, maxLinesFn) { text.each(function(d) { const text = d3.select(this); const words = text.text().split(/\\s+/).reverse(); const x = text.attr('x'); const y = Number(text.attr('y')); const width = widthFn(d); const maxLines = maxLinesFn(d); let line = []; let lineNumber = 0; let word; text.text(null); let tspan = text.append('tspan').attr('x', x).attr('y', y); while ((word = words.pop())) { line.push(word); tspan.text(line.join(' ')); if (tspan.node().getComputedTextLength() > width && line.length > 1) { line.pop(); tspan.text(line.join(' ')); line = [word]; lineNumber += 1; if (lineNumber >= maxLines) { tspan.text(tspan.text() + '…'); break; } tspan = text.append('tspan').attr('x', x).attr('y', y + lineNumber * 15).text(word); } } }); }
    function esc(value) { return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
    render();
    setTimeout(fit, 50);
  </script>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
