class RemoveColumnFromPriorityLevels < ActiveRecord::Migration
  def self.up
    remove_column :priority_levels, :priority_level
  end

  def self.down
    add_column :priority_levels, :priority_level, :integer
  end
end
