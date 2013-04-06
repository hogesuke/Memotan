# coding: utf-8

class LevelupIntervalsController < ApplicationController
  
  def destroy
    @priority_level = PriorityLevel.find(params[:id])
    @priority_level.destroy
    
    redirect_to(priority_levels_path, :notice => "削除に成功しました。")
  end
  
    def select_max_level

    max_level = LevelupInterval.maximum(:learning_level)
    render :json => {:max_level => max_level}
  end
end
