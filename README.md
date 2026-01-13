# API
Está em desenvolvimento, mais recursos irão vir em breve  

Use essa API somente via proxy para o seusite.com/api  
 

## Instalação

> É obrigatório o uso do [Bun](https://bun.sh) para instalar as bibliotecas e rodar a api.  

### 1. Crie e edite o .env
```sh
cp example.env .env # Copia o example.env para .env
code .env # Abre o vscode no .env, permitindo sua edição
```

### 2. Gere uma senha para o JWT de pelo menos 64 caracteres para ter mais segurança
```sh
# Linux & MacOS
openssl rand -base64 48 # Troque de 48 para qualquer outro valor caso queira mais segurança
# Windows
# - Quebre seu teclado
```
- Altere o Campo JWT_SECRET com o resultado.  

### 3. Instale as dependências
```sh
bun install
```

### 4. Dê push ao banco de dados

```sh
bun db:push
bun db:generate
```

### 5. Rode
```sh
# Dev
bun dev
# Produção
bun start
```
