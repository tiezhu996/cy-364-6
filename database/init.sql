CREATE TABLE IF NOT EXISTS operation_records (
  id SERIAL PRIMARY KEY,
  module_name VARCHAR(120) NOT NULL,
  owner_name VARCHAR(80) NOT NULL,
  status VARCHAR(40) NOT NULL,
  metric VARCHAR(40) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO operation_records (module_name, owner_name, status, metric)
VALUES ('多门店SKU统一管理', '运营组', 'ready', '100%');

CREATE TABLE IF NOT EXISTS sku_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skus (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  spec VARCHAR(200) NOT NULL,
  barcode VARCHAR(100) UNIQUE NOT NULL,
  category_id INTEGER NOT NULL REFERENCES sku_categories(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_skus_barcode ON skus(barcode);
CREATE INDEX IF NOT EXISTS idx_skus_category_id ON skus(category_id);

INSERT INTO sku_categories (name) VALUES
('休闲食品'),
('酒水饮料'),
('日用百货'),
('粮油调味')
ON CONFLICT (name) DO NOTHING;

INSERT INTO skus (name, spec, barcode, category_id, status) VALUES
('乐事薯片', '原味 75g', '6924743915855', 1, 'active'),
('可口可乐', '330ml 罐装', '6901939621103', 2, 'active'),
('维达抽纸', '3层 120抽', '6901236341521', 3, 'inactive'),
('海天酱油', '金标生抽 500ml', '6902265112345', 4, 'active')
ON CONFLICT (barcode) DO NOTHING;
