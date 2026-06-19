CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name varchar(200) NOT NULL,
  specialty varchar(160) NOT NULL,
  phone varchar(40),
  email varchar(320),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
