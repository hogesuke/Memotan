class AddLastLevelChangedDateToWords < ActiveRecord::Migration
  def self.up
    change_table :words do |t|
      t.datetime :last_level_changed_at
    end
  end
  
  def self.down
    change_table :words do |t|
      t.remove :last_level_changed_at
    end
  end
end
