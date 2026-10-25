-- Структура БД інформаційної системи для управління платіжними операціями клієнтів

-- Клієнти
CREATE TABLE clients (
    id         bigserial              NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name  character varying(100) NOT NULL,
    age        integer                NOT NULL
);

-- Отримувачі платежів (компанії, постачальники послуг)
CREATE TABLE recipients (
    id       bigserial              NOT NULL,
    name     character varying(255) NOT NULL,
    iban     character varying(34)  NOT NULL,
    edrpou   character varying(10),
    category character varying(100)
);

-- Платіжні рахунки клієнтів
CREATE TABLE accounts (
    id        bigserial             NOT NULL,
    client_id bigint                NOT NULL,
    iban      character varying(34) NOT NULL,
    currency  character varying(3)  NOT NULL,
    balance   numeric(15, 2)        NOT NULL DEFAULT 0,
    opened_at timestamp             NOT NULL DEFAULT now(),
    active    boolean               NOT NULL DEFAULT true
);

-- Платіжні картки, прив'язані до рахунків
CREATE TABLE payment_cards (
    id            bigserial              NOT NULL,
    account_id    bigint                 NOT NULL,
    masked_number character varying(19)  NOT NULL,
    card_holder   character varying(100) NOT NULL,
    expiry_date   character varying(7)   NOT NULL, -- формат YYYY-MM
    card_type     character varying(10)  NOT NULL,
    blocked       boolean                NOT NULL DEFAULT false
);

-- Платіжні операції
CREATE TABLE payment_operations (
    id           bigserial              NOT NULL,
    account_id   bigint                 NOT NULL,
    card_id      bigint,
    recipient_id bigint,
    type         character varying(20)  NOT NULL,
    amount       numeric(15, 2)         NOT NULL,
    commission   numeric(15, 2)         NOT NULL DEFAULT 0,
    currency     character varying(3)   NOT NULL,
    status       character varying(20)  NOT NULL DEFAULT 'PENDING',
    description  character varying(500),
    created_at   timestamp              NOT NULL DEFAULT now()
);

-- Первинні ключі
ALTER TABLE clients            ADD PRIMARY KEY (id);
ALTER TABLE recipients         ADD PRIMARY KEY (id);
ALTER TABLE accounts           ADD PRIMARY KEY (id);
ALTER TABLE payment_cards      ADD PRIMARY KEY (id);
ALTER TABLE payment_operations ADD PRIMARY KEY (id);

-- Унікальність
ALTER TABLE accounts      ADD CONSTRAINT uq_accounts_iban      UNIQUE (iban);
ALTER TABLE payment_cards ADD CONSTRAINT uq_cards_masked_number UNIQUE (masked_number);

-- Зовнішні ключі (зв'язки між таблицями)
ALTER TABLE accounts
    ADD CONSTRAINT fk_accounts_client_id
        FOREIGN KEY (client_id) REFERENCES clients (id);

ALTER TABLE payment_cards
    ADD CONSTRAINT fk_cards_account_id
        FOREIGN KEY (account_id) REFERENCES accounts (id);

ALTER TABLE payment_operations
    ADD CONSTRAINT fk_operations_account_id
        FOREIGN KEY (account_id) REFERENCES accounts (id);

ALTER TABLE payment_operations
    ADD CONSTRAINT fk_operations_card_id
        FOREIGN KEY (card_id) REFERENCES payment_cards (id);

ALTER TABLE payment_operations
    ADD CONSTRAINT fk_operations_recipient_id
        FOREIGN KEY (recipient_id) REFERENCES recipients (id);

-- Перевірки допустимих значень (відповідають enum-ам у Java)
ALTER TABLE clients
    ADD CONSTRAINT chk_clients_age CHECK (age >= 14);

ALTER TABLE accounts
    ADD CONSTRAINT chk_accounts_currency CHECK (currency IN ('UAH', 'USD', 'EUR'));

ALTER TABLE payment_cards
    ADD CONSTRAINT chk_cards_type CHECK (card_type IN ('DEBIT', 'CREDIT'));

ALTER TABLE payment_operations
    ADD CONSTRAINT chk_operations_type
        CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT', 'REFUND'));

ALTER TABLE payment_operations
    ADD CONSTRAINT chk_operations_status
        CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'));

ALTER TABLE payment_operations
    ADD CONSTRAINT chk_operations_currency CHECK (currency IN ('UAH', 'USD', 'EUR'));

ALTER TABLE payment_operations
    ADD CONSTRAINT chk_operations_amount CHECK (amount > 0);

-- Індекси для частих запитів
CREATE INDEX idx_accounts_client_id      ON accounts (client_id);
CREATE INDEX idx_cards_account_id        ON payment_cards (account_id);
CREATE INDEX idx_operations_account_id   ON payment_operations (account_id);
CREATE INDEX idx_operations_created_at   ON payment_operations (created_at);
