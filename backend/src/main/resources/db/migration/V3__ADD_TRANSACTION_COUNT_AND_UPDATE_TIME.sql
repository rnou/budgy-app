ALTER TABLE budgets
    ADD transaction_count INT NULL;

ALTER TABLE budgets
    MODIFY transaction_count INT NOT NULL;

ALTER TABLE transactions
    ADD updated_at datetime NULL;