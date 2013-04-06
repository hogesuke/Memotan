class RemoveWordColumnFromWords < ActiveRecord::Migration
  def self.up
    remove_column :words, :word
  end

  def self.down
    add_column :words, :word, :string
  end
end
