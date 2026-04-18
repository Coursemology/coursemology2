# Rails Credentials

Rails 5.2 introduced encrypted credentials files to replace the old `secrets.yml` system. We adopted environment-specific credential files as part of upgrading to Rails 7.2.

For a complete primer, refer to this [guide on Rails credentials](https://medium.com/@kmvel95/understanding-rails-credentials-master-keys-secret-keys-encryption-a-complete-guide-283a395c6638).

## File structure

Each environment has two files:

- `<environment>.key`, the decryption key that allows reading the `.yml.enc` file. **Keys from deployed environments (staging and production) must NEVER BE COMMITTED.** Once leaked, all secrets in the environment will be compromised.
- `<environment>.yml.enc`, an encrypted YAML file containing sensitive environment data (e.g. API keys). While theoretically safe to commit because the data is unreadable without the decryption key, we currently do not commit files containing real sensitive data as an additional safety measure.

The `development` and `test` key files are checked into this repository, so local development works out of the box. The sample credentials use the same structure as staging/production but with redacted values, so external API integrations (e.g. Codaveri, AWS) will not function.

If you are a Coursemology team member who needs working credentials, contact current staff for the appropriate credentials file.

## Accessing credentials in code

Decrypted credentials are accessible anywhere in the application as a nested object:

```ruby
Rails.application.credentials.aws.s3_file_bucket.bucket
Rails.application.credentials.aws.s3_file_bucket.access_key_id
Rails.application.credentials.aws.s3_file_bucket.secret_access_key
```

This mirrors the YAML structure inside the `.enc` file.

## Viewing and editing credentials

Both commands require the `.key` file for the target environment to be present in this directory.

```bash
# Print decrypted contents
bundle exec rails credentials:show --environment <environment>

# Open decrypted contents in an editor
bundle exec rails credentials:edit --environment <environment>
```

The edit command uses the editor set in `$VISUAL` or `$EDITOR`. For example, if VSCode is installed, Rails can be directed to use it as follows:

```bash
EDITOR="code --wait" bundle exec rails credentials:edit --environment <environment>
```
