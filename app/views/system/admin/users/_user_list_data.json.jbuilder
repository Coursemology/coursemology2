# frozen_string_literal: true

json.id user.id
json.name user.name
json.email user.email
json.instances @instances_preload_service.instances_for(user.id)&.each do |instance|
  json.name instance.name
  json.host instance.host
end
json.role user.role
json.canMasquerade user.can_masquerade?
json.masqueradePath masquerade_path(user) if user.can_masquerade?

# = content_tag_for(:tr, user, 'data-action' => admin_user_path(user),
#                              'data-method' => 'patch')
#   = simple_fields_for user do |f|
#     td = f.input :name, label: false
#     td = user.email
#     td
#       ul.list-unstyled
#         - @instances_preload_service.instances_for(user.id)&.each do |instance|
#           li = link_to instance.name, host: instance.host
#     td = f.input :role, as: :select, collection: User.roles.keys - ['auto_grader'], label: false
#     td
#       = f.button :submit, id: 'update' do
#         = fa_icon 'check'.freeze
#       = delete_button([:admin, user])
#       - if user.can_masquerade?
#         = link_to masquerade_path(user), id: "masquerade_#{user.id}", class: ['btn', 'btn-default'], title: t('.masquerade') do
#           = fa_icon 'user-secret'.freeze
#       - else
#         = link_to '#', class: ['btn', 'btn-default'], title: t('.not_confirmed'), disabled: true do
#           = fa_icon 'user-secret'.freeze
