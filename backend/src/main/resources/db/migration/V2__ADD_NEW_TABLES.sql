CREATE TABLE budgets
(
    id           BIGINT AUTO_INCREMENT NOT NULL,
    category     VARCHAR(255)   NOT NULL,
    spent        DECIMAL(10, 2) NOT NULL,
    limit_amount DECIMAL(10, 2) NOT NULL,
    color        VARCHAR(255) NULL,
    user_id      BIGINT         NOT NULL,
    created_at   datetime NULL,
    updated_at   datetime NULL,
    CONSTRAINT pk_budgets PRIMARY KEY (id)
);

CREATE TABLE recurring_bills
(
    id         BIGINT AUTO_INCREMENT NOT NULL,
    name       VARCHAR(255)   NOT NULL,
    amount     DECIMAL(10, 2) NOT NULL,
    due_date   date           NOT NULL,
    status     VARCHAR(20)    NOT NULL,
    category   VARCHAR(255)   NOT NULL,
    user_id    BIGINT         NOT NULL,
    created_at datetime NULL,
    updated_at datetime NULL,
    CONSTRAINT pk_recurring_bills PRIMARY KEY (id)
);

CREATE TABLE saving_pots
(
    id         BIGINT AUTO_INCREMENT NOT NULL,
    name       VARCHAR(255)   NOT NULL,
    saved      DECIMAL(10, 2) NOT NULL,
    goal       DECIMAL(10, 2) NOT NULL,
    icon       VARCHAR(255) NULL,
    color      VARCHAR(255) NULL,
    user_id    BIGINT         NOT NULL,
    created_at datetime NULL,
    updated_at datetime NULL,
    CONSTRAINT pk_saving_pots PRIMARY KEY (id)
);

CREATE TABLE transactions
(
    id               BIGINT AUTO_INCREMENT NOT NULL,
    name             VARCHAR(255)   NOT NULL,
    transaction_date date           NOT NULL,
    amount           DECIMAL(10, 2) NOT NULL,
    category         VARCHAR(255)   NOT NULL,
    type             VARCHAR(20)    NOT NULL,
    icon             VARCHAR(255) NULL,
    color            VARCHAR(255) NULL,
    user_id          BIGINT         NOT NULL,
    budget_id        BIGINT NULL,
    saving_pot_id    BIGINT NULL,
    created_at       datetime NULL,
    CONSTRAINT pk_transactions PRIMARY KEY (id)
);

ALTER TABLE budgets
    ADD CONSTRAINT FK_BUDGETS_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE recurring_bills
    ADD CONSTRAINT FK_RECURRING_BILLS_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE saving_pots
    ADD CONSTRAINT FK_SAVING_POTS_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE transactions
    ADD CONSTRAINT FK_TRANSACTIONS_ON_BUDGET FOREIGN KEY (budget_id) REFERENCES budgets (id);

ALTER TABLE transactions
    ADD CONSTRAINT FK_TRANSACTIONS_ON_SAVING_POT FOREIGN KEY (saving_pot_id) REFERENCES saving_pots (id);

ALTER TABLE transactions
    ADD CONSTRAINT FK_TRANSACTIONS_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);