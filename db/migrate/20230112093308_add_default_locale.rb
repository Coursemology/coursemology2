class AddDefaultLocale < ActiveRecord::Migration[6.0]
  def change
    User.where(locale: nil).update_all(locale: :en)
    change_column_null :users, :locale, false
    change_column_default :users, :locale, from: nil, to: :en
  end
end
