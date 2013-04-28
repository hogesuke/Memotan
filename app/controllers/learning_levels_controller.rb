# coding: utf-8

class LearningLevelsController < ApplicationController
  
  def index
    @learning_level = LearningLevel.all
  end
  
  def new
    @learning_level = LearningLevel.new
  end
  
  def edit
    @learning_level = LearningLevel.find(params[:id])
  end
  
  def create
    @learning_level = LearningLevel.new(params[:learning_level])
    
    if @learning_level.save
      redirect_to(learning_levels_path, :notice => "新規作成に成功しました。")
    else
      render :action => "new"
    end
  end
  
  def update
    @learning_level = LearningLevel.find(params[:id])
    
    if @learning_level.update_attributes(params[:learning_level])
      redirect_to(learning_levels_path, :notice => "更新に成功しました。")
    else
      render :action => "edit"
    end
  end
  
  def destroy
    @learning_level = LearningLevel.find(params[:id])
    @learning_level.destroy
    
    redirect_to(learning_levels_path, :notice => "削除に成功しました。")
  end

  def select_max_level
    max_level = LearningLevel.select_max_level
    render :json => {:max_level => max_level}
  end
end
