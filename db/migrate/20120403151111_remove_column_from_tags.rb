class RemoveColumnFromTags < ActiveRecord::Migration
  def self.up
    remove_column :tags, :caption
  end

  def self.down
    add_column :tags, :caption, :string
  end
end
