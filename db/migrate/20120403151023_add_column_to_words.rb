class AddColumnToWords < ActiveRecord::Migration
  def self.up
    add_column :words, :word, :string
    add_column :words, :learning_level_id, :integer
    add_column :words, :last_learned_at, :date
  end

  def self.down
    remove_column :words, :last_learned_at
    remove_column :words, :learning_level_id
    remove_column :words, :word
  end
end
