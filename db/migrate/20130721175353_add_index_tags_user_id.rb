class AddIndexTagsUserId < ActiveRecord::Migration
  def self.up
    add_index :tags, :user_id
  end

  def self.down
    remove_index :tags, :user_id
  end
end
