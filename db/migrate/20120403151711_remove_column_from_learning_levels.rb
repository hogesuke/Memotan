class RemoveColumnFromLearningLevels < ActiveRecord::Migration
  def self.up
    remove_column :learning_levels, :learning_level
  end

  def self.down
    add_column :learning_levels, :learning_level, :integer
  end
end
