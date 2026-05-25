; HexBrief custom NSIS installer
; Uses /redefine to override electron-builder defaults safely

!macro customHeader
  !define /redefine MUI_WELCOMEPAGE_TITLE "Welcome to HexBrief"
  !define /redefine MUI_WELCOMEPAGE_TEXT "HexBrief is your personal morning dashboard.$\r$\n$\r$\nWeather, tasks, headlines and calendar \
— all in one place. No accounts, no tracking, no subscriptions.$\r$\n$\r$\nClick Next to continue."
  !define /redefine MUI_FINISHPAGE_TITLE "HexBrief is ready"
  !define /redefine MUI_FINISHPAGE_TEXT "HexBrief has been installed successfully.$\r$\n$\r$\nOpen it each morning for your daily brief."
  !define /redefine MUI_FINISHPAGE_RUN "$INSTDIR\HexBrief.exe"
  !define /redefine MUI_FINISHPAGE_RUN_TEXT "Launch HexBrief now"
!macroend

!macro customInstall
  WriteRegStr HKCU "Software\HexBrief" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\HexBrief" "Version" "${VERSION}"
  CreateShortCut "$QUICKLAUNCH\HexBrief.lnk" "$INSTDIR\HexBrief.exe"
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\HexBrief"
  Delete "$QUICKLAUNCH\HexBrief.lnk"
!macroend
