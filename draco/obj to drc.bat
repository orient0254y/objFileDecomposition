@echo off & color 2b
for %%i in (*.obj) do E:\wamp\www\objFileDecomposition\draco\draco_encoder.exe -i ./%%i -o ./%%i.drc
color 3a & setlocal enabledelayedexpansion
title �����滻�ļ�(�ļ���)��
echo ��������������滻���ļ������ļ����������ļ�(�ļ���)����
echo.
set /p str1= ������Ҫ�滻���ļ�(�ļ���)���ַ��������滻�ո񣩣�
set /p str2= �������滻����ļ�(�ļ���)���ַ�����ȥ����ֱ�ӻس�����
echo.
echo �����滻�ļ�������
for /f "delims=" %%a in ('dir /a-d /s /b') do (
if "%%~nxa" neq "%~nx0" (
set "f=%%~na"
set "f=!f:%str1%=%str2%!"
if not exist "%%~dpa!f!%%~xa" ren "%%a" "!f!%%~xa"
)
)
echo �滻�ļ������
echo.
echo �����滻�ļ���������
:folder
set n=0
for /f "delims=" %%i in ('dir /ad /s /b ^|find "%str1%"') do (
set t=%%~ni
set t=!t:%str1%=%str2%!
if not exist "%%~dpi!t!" ren "%%i" "!t!" 2>nul
set /a n+=1
)
if "!n!" neq "0" goto folder
echo �滻�ļ��������
for /f "delims=" %%a in ('dir /o-n /b /ad') do move "%%a*.xls" "%%a\"
pause