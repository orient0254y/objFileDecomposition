@echo off & color 2b
for %%i in (*.obj) do E:\wamp\www\objFileDecomposition\draco\draco_encoder.exe -i ./%%i -o ./%%i.drc
color 3a & setlocal enabledelayedexpansion
title 批量替换文件(文件夹)名
echo 此批处理可批量替换本文件所在文件夹下所有文件(文件夹)名。
echo.
set /p str1= 请输入要替换的文件(文件夹)名字符串（可替换空格）：
set /p str2= 请输入替换后的文件(文件夹)名字符串（去除则直接回车）：
echo.
echo 正在替换文件名……
for /f "delims=" %%a in ('dir /a-d /s /b') do (
if "%%~nxa" neq "%~nx0" (
set "f=%%~na"
set "f=!f:%str1%=%str2%!"
if not exist "%%~dpa!f!%%~xa" ren "%%a" "!f!%%~xa"
)
)
echo 替换文件名完成
echo.
echo 正在替换文件夹名……
:folder
set n=0
for /f "delims=" %%i in ('dir /ad /s /b ^|find "%str1%"') do (
set t=%%~ni
set t=!t:%str1%=%str2%!
if not exist "%%~dpi!t!" ren "%%i" "!t!" 2>nul
set /a n+=1
)
if "!n!" neq "0" goto folder
echo 替换文件夹名完成
for /f "delims=" %%a in ('dir /o-n /b /ad') do move "%%a*.xls" "%%a\"
pause