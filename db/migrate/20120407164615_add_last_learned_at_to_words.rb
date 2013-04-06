class AddLastLearnedAtToWords < ActiveRecord::Migration
  def self.up
    add_column :words, :last_learned_at, :datetime
  end

  def self.down
    remove_column :words, :last_learned_at
  end
end
