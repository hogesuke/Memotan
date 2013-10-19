class RemoveUsernameAndPasswordAndEmailAndDmAndRolesFromUsers < ActiveRecord::Migration
  def self.up
    remove_column :users, :username
    remove_column :users, :password
    remove_column :users, :email
    remove_column :users, :dm
    remove_column :users, :roles
  end

  def self.down
    add_column :users, :username
    add_column :users, :password
    add_column :users, :email
    add_column :users, :dm
    add_column :users, :roles
  end
end
