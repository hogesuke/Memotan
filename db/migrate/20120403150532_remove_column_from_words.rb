class RemoveColumnFromWords < ActiveRecord::Migration
  def self.up
    remove_column :words, :text
  end

  def self.down
    add_column :words, :text, :string
  end
end
