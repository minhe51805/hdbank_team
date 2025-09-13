CREATE TABLE IF NOT EXISTS features_monthly (
  customer_id               INTEGER NOT NULL,
  year_month                VARCHAR(7) NOT NULL,
  age                       INTEGER,
  segment                   VARCHAR(32),

  income                    NUMERIC(18,2),
  spend                     NUMERIC(18,2),
  balance_avg               NUMERIC(18,2),
  loan                      NUMERIC(18,2),

  digital_logins_30d        INTEGER,
  incoming_tx_cnt_30d       INTEGER,
  outgoing_tx_cnt_30d       INTEGER,

  salary_variance           NUMERIC(18,2),
  balance_trend_90d         NUMERIC(18,2),

  spend_travel              NUMERIC(18,2),
  spend_food_grocery        NUMERIC(18,2),
  spend_entertainment       NUMERIC(18,2),
  spend_education           NUMERIC(18,2),
  spend_utilities           NUMERIC(18,2),
  spend_health              NUMERIC(18,2),
  spend_shopping            NUMERIC(18,2),

  travel_tx_cnt_90d         INTEGER,
  recency_last_travel_days  INTEGER,

  bill_autopay_active       INTEGER,                    
  failed_payments_90d       INTEGER,
  payday_cadence_days       INTEGER,
  days_since_last_payday    INTEGER,

  season_flag               VARCHAR,
  upcoming_bill_due_days    INTEGER,

  balance_ratio             NUMERIC(9,6),
  surplus                   NUMERIC(18,2),
  spend_ratio               NUMERIC(9,6),
  dti                       NUMERIC(9,6),
  cashflow_volatility       NUMERIC(9,6),
  liquidity_buffer          NUMERIC(9,6),
  digital_index             NUMERIC(9,6),

  inflow_baseline_90d       NUMERIC(18,2),
  max_inflow_z_30d          NUMERIC(9,6),
  max_inflow_pct_30d        NUMERIC(9,6),

  large_inflow_flag_7d      INTEGER,
  days_since_large_inflow   INTEGER
)

-- Khoá & chỉ mục gợi ý (để join/truy vấn nhanh)
ALTER TABLE features_monthly
  ADD CONSTRAINT features_monthly_pk PRIMARY KEY (customer_id, year_month)
CREATE INDEX IF NOT EXISTS idx_feat_year_month ON features_monthly(year_month)
CREATE INDEX IF NOT EXISTS idx_feat_segment    ON features_monthly(segment)

CREATE TABLE IF NOT EXISTS labels (
  customer_id      INTEGER NOT NULL,
  year_month       VARCHAR(7) NOT NULL,
  label_interest   INTEGER NOT NULL  -- 0/1
)

ALTER TABLE labels
  ADD CONSTRAINT labels_pk PRIMARY KEY (customer_id, year_month)









