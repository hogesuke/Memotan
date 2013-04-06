class CreatePriorityLevels < ActiveRecord::Migration
  def self.up
    create_table :priority_levels do |t|
      t.integer :priority_level
      t.string :label

      t.timestamps
    end
  end

  def self.down
    drop_table :priority_levels
  end
end
