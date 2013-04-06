class AddColumnToLearningLevels < ActiveRecord::Migration
  def self.up
    add_column :learning_levels, :level, :integer
  end

  def self.down
    remove_column :learning_levels, :level
  end
end
