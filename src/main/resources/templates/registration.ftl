<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <title>Реєстрація</title>
    <style>
        body { font-family: sans-serif; background: #f4f5f7; display: flex; justify-content: center; padding-top: 80px; }
        form { background: #fff; padding: 32px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.1); width: 320px; }
        h2 { margin-top: 0; }
        label { display: block; margin: 12px 0 4px; }
        input { width: 100%; padding: 8px; box-sizing: border-box; }
        button { margin-top: 20px; width: 100%; padding: 10px; background: #0d6efd; color: #fff; border: 0; border-radius: 4px; cursor: pointer; }
        .error { color: #c00; margin-bottom: 8px; }
        .link { margin-top: 16px; text-align: center; }
    </style>
</head>
<body>
<form method="post" action="/registration">
    <h2>Реєстрація</h2>

    <#if error??>
        <div class="error">${error}</div>
    </#if>

    <label for="username">Логін</label>
    <input id="username" name="username" required autofocus>

    <label for="password">Пароль</label>
    <input id="password" name="password" type="password" required>

    <button type="submit">Зареєструватися</button>

    <div class="link">Вже є акаунт? <a href="/login">Увійти</a></div>
</form>
</body>
</html>
