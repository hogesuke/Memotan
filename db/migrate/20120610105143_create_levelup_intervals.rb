class CreateLevelupIntervals < ActiveRecord::Migration
  def self.up
    create_table :levelup_intervals, :id => false do |t|
      t.string :learning_level
      t.integer :day_interval
    end
  end

  def self.down
    drop_table :levelup_intervals
  end
end
