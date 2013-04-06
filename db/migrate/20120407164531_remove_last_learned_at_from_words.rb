class RemoveLastLearnedAtFromWords < ActiveRecord::Migration
  def self.up
    remove_column :words, :last_learned_at
  end

  def self.down
    add_column :words, :last_learned_at, :date
  end
end
