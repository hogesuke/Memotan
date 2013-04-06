class AddColumnToPriorityLevels < ActiveRecord::Migration
  def self.up
    add_column :priority_levels, :level, :integer
  end

  def self.down
    remove_column :priority_levels, :level
  end
end
