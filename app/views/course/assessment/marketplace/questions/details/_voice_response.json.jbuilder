# Voice questions have no type-specific setup fields; the base prompt is shown by the shell.
# `json.merge!({})` forces the enclosing `json.detail do … end` block to serialize as an empty
# object `{}`. Without it the block's scope stays blank and jbuilder emits `null` instead.
json.merge!({})
