
# NestJS getting started project

## Project Overview
### Brief
- Authentication: JWT (sign and verify with RS256 algorithm), OAuth (login with Google, Line) supported by PassportJS
- Database: TypeORM
- Data validation & transformation : `class-validator`, `class-transformer`
- Configuration: Nest built-in config service (`.env` file insides the project)

### Structure
Project contains 3 modules: `auth`, `users`, `core`

**auth** module functions: 
- register: register new user with email (email verify not implemented yet)
- login: validate username + password and return access token + refresh token, username could be email or phone number
- refresh token: create new access token by refresh token, refresh token must valid and not revoked
- revoke refresh token: revoke token by token id, token id can extract by decoded refresh token payload, user must provide valid access token to performs this function
- social login: support login with Google and Line

**users** module functions:
- validate user
- create new user
- find user
- update user

**core**: global module created to register JWT root configs

## Main points
### Social login flow

<img src="stuffs/images/social_login_flow.png?raw=true" width="512"/>


Another case is login social user with their phone number I cant find the way to claim phone number yet

### Database design
<img src="stuffs/images/erd.png?raw=true" width="512"/>

`refresh_token` table:
- `id`: is the jwtid when we sign with jwt service, I use it to find and revoke token as needed
- `userId`: id of user, use to validate user when they call revoke token (user must own this token to revoke it)

`users`
- `id`: id in format of uuid
- `username`: default is email, could be phone number if we use social login with profile contains only phone numver or profile id if user login with social login and 3rd system not return email or phone
- `email`: could be empty but required when register new user
= `phone`: `email` and `phone` could be empty when user login OAuth (Line for example)
- `password`: hash with brypt, it is combination of brypt(plain password + salt)
- `salt`: random characters, used when hashing password

### What I have learned:
- Nest project structure
- Module, Provider, Controller
- Nest dependency injection
- Authentication with Guards
- Validate request with Pipe, transform with class-transformer
- Dynamic module with forRoot, forFeature, register/registerAsync
- Interact with databases (MySQL, Postgres) with TypeORM

### What I should do for better
- logging
- user should have status (active, inactive, force change password, force update info...)
- verify email, verify phone
- database migration
- social login with phone number
- write test cases


