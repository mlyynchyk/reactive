-- Демонстраційні дані для клієнтської частини

INSERT INTO clients (first_name, last_name, age) VALUES
    ('Олена',    'Коваленко',   34),
    ('Андрій',   'Шевченко',    41),
    ('Марія',    'Бондаренко',  27),
    ('Дмитро',   'Ткаченко',    52),
    ('Ірина',    'Мельник',     23),
    ('Сергій',   'Кравченко',   38);

INSERT INTO recipients (name, iban, edrpou, category) VALUES
    ('Київстар',            'UA903052990000026005010119862', '21673832', 'Мобільний зв''язок'),
    ('Київтеплоенерго',     'UA383510050000026003879056200', '40538421', 'Комунальні послуги'),
    ('Укртелеком',          'UA563226690000026004300087654', '21560766', 'Інтернет'),
    ('Нова пошта',          'UA213052990000026009035003791', '31316718', 'Доставка'),
    ('Сільпо',              'UA613515330000026005300450012', '40720198', 'Продукти'),
    ('Київська міська рада','UA748999980314030544000026001', '22883141', 'Податки та збори');

INSERT INTO accounts (client_id, iban, currency, balance, opened_at, active)
SELECT c.id, a.iban, a.currency, a.balance, a.opened_at, a.active
FROM (VALUES
    ('Коваленко',  'UA483052990000026201234567801', 'UAH', 48250.00, TIMESTAMP '2023-03-14 10:15:00', true),
    ('Коваленко',  'UA483052990000026201234567802', 'USD',  1520.75, TIMESTAMP '2024-01-20 12:00:00', true),
    ('Шевченко',   'UA483052990000026201234567803', 'UAH', 12890.40, TIMESTAMP '2022-11-02 09:30:00', true),
    ('Шевченко',   'UA483052990000026201234567804', 'EUR',   830.00, TIMESTAMP '2024-06-11 16:45:00', false),
    ('Бондаренко', 'UA483052990000026201234567805', 'UAH',  6340.15, TIMESTAMP '2024-09-05 11:20:00', true),
    ('Ткаченко',   'UA483052990000026201234567806', 'UAH', 97500.00, TIMESTAMP '2021-07-19 14:00:00', true),
    ('Ткаченко',   'UA483052990000026201234567807', 'USD',  4200.00, TIMESTAMP '2023-02-28 10:00:00', true),
    ('Мельник',    'UA483052990000026201234567808', 'UAH',  1875.60, TIMESTAMP '2025-02-10 13:10:00', true),
    ('Кравченко',  'UA483052990000026201234567809', 'UAH', 23110.00, TIMESTAMP '2023-08-08 08:45:00', true)
) AS a(last_name, iban, currency, balance, opened_at, active)
JOIN clients c ON c.last_name = a.last_name;

INSERT INTO payment_cards (account_id, masked_number, card_holder, expiry_date, card_type, blocked)
SELECT acc.id, p.masked_number, p.card_holder, p.expiry_date, p.card_type, p.blocked
FROM (VALUES
    ('UA483052990000026201234567801', '5168 **** **** 4401', 'OLENA KOVALENKO',  '2028-04', 'DEBIT',  false),
    ('UA483052990000026201234567802', '4149 **** **** 7702', 'OLENA KOVALENKO',  '2027-11', 'CREDIT', false),
    ('UA483052990000026201234567803', '5375 **** **** 1203', 'ANDRII SHEVCHENKO','2026-12', 'DEBIT',  false),
    ('UA483052990000026201234567804', '4731 **** **** 9904', 'ANDRII SHEVCHENKO','2027-06', 'CREDIT', true),
    ('UA483052990000026201234567805', '5168 **** **** 3305', 'MARIIA BONDARENKO','2029-01', 'DEBIT',  false),
    ('UA483052990000026201234567806', '4149 **** **** 6606', 'DMYTRO TKACHENKO', '2028-09', 'CREDIT', false),
    ('UA483052990000026201234567808', '5375 **** **** 8808', 'IRYNA MELNYK',     '2030-02', 'DEBIT',  false),
    ('UA483052990000026201234567809', '4731 **** **** 2209', 'SERHII KRAVCHENKO','2027-08', 'DEBIT',  false)
) AS p(iban, masked_number, card_holder, expiry_date, card_type, blocked)
JOIN accounts acc ON acc.iban = p.iban;

INSERT INTO payment_operations (account_id, card_id, recipient_id, type, amount, commission, currency, status, description, created_at)
SELECT acc.id, card.id, rec.id, o.type, o.amount, o.commission, acc.currency, o.status, o.description, o.created_at
FROM (VALUES
    ('UA483052990000026201234567801', '5168 **** **** 4401', 'Київстар',             'PAYMENT',    250.00,  0.00, 'COMPLETED', 'Поповнення мобільного',          TIMESTAMP '2026-10-01 09:12:00'),
    ('UA483052990000026201234567801', '5168 **** **** 4401', 'Київтеплоенерго',      'PAYMENT',   1834.56,  9.17, 'COMPLETED', 'Опалення за вересень',            TIMESTAMP '2026-10-03 18:40:00'),
    ('UA483052990000026201234567801', NULL,                  NULL,                   'DEPOSIT',  25000.00,  0.00, 'COMPLETED', 'Зарплата',                        TIMESTAMP '2026-10-05 10:00:00'),
    ('UA483052990000026201234567801', '5168 **** **** 4401', 'Сільпо',               'PAYMENT',   1278.30,  0.00, 'COMPLETED', 'Покупка продуктів',               TIMESTAMP '2026-10-12 19:25:00'),
    ('UA483052990000026201234567802', '4149 **** **** 7702', NULL,                   'WITHDRAWAL', 200.00,  2.00, 'COMPLETED', 'Зняття готівки',                  TIMESTAMP '2026-10-08 14:05:00'),
    ('UA483052990000026201234567803', '5375 **** **** 1203', 'Укртелеком',           'PAYMENT',    320.00,  0.00, 'COMPLETED', 'Домашній інтернет',               TIMESTAMP '2026-10-02 08:30:00'),
    ('UA483052990000026201234567803', NULL,                  'Київська міська рада', 'PAYMENT',   2150.00, 10.75, 'PENDING',   'Податок на нерухомість',          TIMESTAMP '2026-10-24 11:00:00'),
    ('UA483052990000026201234567803', '5375 **** **** 1203', 'Нова пошта',           'PAYMENT',     95.00,  0.00, 'FAILED',    'Оплата доставки — недостатньо коштів на картці', TIMESTAMP '2026-10-15 16:20:00'),
    ('UA483052990000026201234567805', '5168 **** **** 3305', 'Київстар',             'PAYMENT',    150.00,  0.00, 'COMPLETED', 'Поповнення мобільного',          TIMESTAMP '2026-10-06 12:45:00'),
    ('UA483052990000026201234567805', NULL,                  NULL,                   'TRANSFER',  1500.00,  7.50, 'COMPLETED', 'Переказ на рахунок Мельник І.',   TIMESTAMP '2026-10-09 20:10:00'),
    ('UA483052990000026201234567805', '5168 **** **** 3305', 'Сільпо',               'REFUND',     210.40,  0.00, 'COMPLETED', 'Повернення за товар',             TIMESTAMP '2026-10-13 10:05:00'),
    ('UA483052990000026201234567806', '4149 **** **** 6606', 'Київтеплоенерго',      'PAYMENT',   2410.90, 12.05, 'COMPLETED', 'Опалення та гаряча вода',         TIMESTAMP '2026-10-04 07:55:00'),
    ('UA483052990000026201234567806', NULL,                  NULL,                   'DEPOSIT',  40000.00,  0.00, 'COMPLETED', 'Повернення депозиту',             TIMESTAMP '2026-10-10 09:00:00'),
    ('UA483052990000026201234567806', '4149 **** **** 6606', 'Нова пошта',           'PAYMENT',    145.00,  0.00, 'CANCELLED', 'Скасоване відправлення',          TIMESTAMP '2026-10-18 15:30:00'),
    ('UA483052990000026201234567807', NULL,                  NULL,                   'WITHDRAWAL', 500.00,  5.00, 'PENDING',   'Зняття готівки у відділенні',     TIMESTAMP '2026-10-25 09:40:00'),
    ('UA483052990000026201234567808', '5375 **** **** 8808', NULL,                   'DEPOSIT',   1500.00,  0.00, 'COMPLETED', 'Переказ від Бондаренко М.',       TIMESTAMP '2026-10-09 20:10:00'),
    ('UA483052990000026201234567808', '5375 **** **** 8808', 'Київстар',             'PAYMENT',    100.00,  0.00, 'COMPLETED', 'Поповнення мобільного',          TIMESTAMP '2026-10-20 17:00:00'),
    ('UA483052990000026201234567809', '4731 **** **** 2209', 'Укртелеком',           'PAYMENT',    320.00,  0.00, 'COMPLETED', 'Домашній інтернет',               TIMESTAMP '2026-10-02 09:15:00'),
    ('UA483052990000026201234567809', '4731 **** **** 2209', 'Київська міська рада', 'PAYMENT',    680.00,  3.40, 'COMPLETED', 'Плата за паркування',             TIMESTAMP '2026-10-17 13:35:00'),
    ('UA483052990000026201234567809', NULL,                  NULL,                   'TRANSFER',  5000.00, 25.00, 'PENDING',   'Переказ на ФОП-рахунок',          TIMESTAMP '2026-10-23 18:00:00')
) AS o(iban, masked_number, recipient, type, amount, commission, status, description, created_at)
JOIN accounts acc            ON acc.iban = o.iban
LEFT JOIN payment_cards card ON card.masked_number = o.masked_number
LEFT JOIN recipients rec     ON rec.name = o.recipient;
