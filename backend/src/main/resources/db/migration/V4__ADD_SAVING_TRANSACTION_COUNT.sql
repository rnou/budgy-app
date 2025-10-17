ALTER TABLE saving_pots
    ADD transaction_count INT NULL;

ALTER TABLE saving_pots
    MODIFY transaction_count INT NOT NULL;