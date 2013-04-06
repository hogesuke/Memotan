# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20120617132355) do

  create_table "learning_levels", :force => true do |t|
    t.string   "label"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "level"
  end

  create_table "levelup_intervals", :id => false, :force => true do |t|
    t.string  "learning_level"
    t.integer "day_interval"
  end

  create_table "priority_levels", :force => true do |t|
    t.string   "label"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "level"
  end

  create_table "tags", :force => true do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "label"
    t.integer  "user_id"
  end

  create_table "tags_words", :id => false, :force => true do |t|
    t.integer "tag_id"
    t.integer "word_id"
  end

  create_table "users", :force => true do |t|
    t.string   "username"
    t.string   "password"
    t.string   "email"
    t.boolean  "dm"
    t.string   "roles"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "words", :force => true do |t|
    t.string   "description"
    t.integer  "priority_level_id"
    t.integer  "point"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "learning_level_id"
    t.string   "spelling"
    t.datetime "last_learned_at"
    t.datetime "last_level_changed_at"
  end

end
