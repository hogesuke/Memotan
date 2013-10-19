class RemovePriorityLevelIdAndPointAndLastLearnedAtFromWords < ActiveRecord::Migration
  def self.up
    remove_column :words, :priority_level_id
    remove_column :words, :point
    remove_column :words, :last_learned_at
  end

  def self.down
    add_column :words, :priority_level_id
    add_column :words, :point
    add_column :words, :last_learned_at
  end
end
