json.partial! 'question'
json.partial! 'test_ui'
json.partial! 'package_ui'
json.partial! 'import_result'

if @redirect_url
  json.redirect_url @redirect_url
end
