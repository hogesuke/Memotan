class CreateLearningLevels < ActiveRecord::Migration
  def self.up
    create_table :learning_levels do |t|
      t.integer :learning_level
      t.string :label

      t.timestamps
    end
  end

  def self.down
    drop_table :learning_levels
  end
end
