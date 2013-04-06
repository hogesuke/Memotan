class AddColumnToTags < ActiveRecord::Migration
  def self.up
    add_column :tags, :label, :string
  end

  def self.down
    remove_column :tags, :label
  end
end
