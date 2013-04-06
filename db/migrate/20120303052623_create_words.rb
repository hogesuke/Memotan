class CreateWords < ActiveRecord::Migration
  def self.up
    create_table :words do |t|
      t.string :text
      t.string :description
      t.integer :priority_level_id
      t.integer :point
      t.integer :user_id

      t.timestamps
    end
  end

  def self.down
    drop_table :words
  end
end
