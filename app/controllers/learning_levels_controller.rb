# coding: utf-8

class LearningLevelsController < ApplicationController
  
  def select_max_level
    max_level = LearningLevel.select_max_level
    render :json => {:max_level => max_level}
  end
end
