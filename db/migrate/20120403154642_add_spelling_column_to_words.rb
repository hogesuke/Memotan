class AddSpellingColumnToWords < ActiveRecord::Migration
  def self.up
    add_column :words, :spelling, :string
  end

  def self.down
    remove_column :words, :spelling
  end
end
