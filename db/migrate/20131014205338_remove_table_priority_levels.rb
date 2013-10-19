class RemoveTablePriorityLevels < ActiveRecord::Migration
  def self.up
    drop_table :priority_levels
  end

  def self.down
    create_table :priority_levels do |t|
      t.string :label
      t.timestamps
    end
  end
end
