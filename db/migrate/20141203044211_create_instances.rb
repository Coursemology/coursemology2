class CreateInstances < ActiveRecord::Migration
  def change
    create_table :instances do |t|
      t.string :host,
               null:    false,
               index:   {
                   case_sensitive: false,
                   unique:         true
               },
               comment: 'Stores the host name of the instance. The www prefix is automatically handled by the ' +
                            'application'
    end
  end
end
