CREATE TABLE users
(
    id              BIGINT AUTO_INCREMENT NOT NULL,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    password        VARCHAR(255) NOT NULL,
    initials        VARCHAR(10) NULL,
    current_balance DECIMAL(10, 2) NULL,
    created_at      datetime NULL,
    updated_at      datetime NULL,
    CONSTRAINT pk_users PRIMARY KEY (id)
);

ALTER TABLE users
    ADD CONSTRAINT uc_users_email UNIQUE (email);