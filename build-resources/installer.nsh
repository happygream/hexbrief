; HexBrief NSIS installer
; customHeader must be empty — all defines go in customWelcomePage/customFinishPage

!macro customHeader
!macroend

!macro customWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Welcome to HexBrief"
  !define MUI_WELCOMEPAGE_TEXT "Your personal morning dashboard.$\r$\n$\r$\nWeather, tasks, headlines and calendar in one place.$\r$\nNo accounts. No tracking. No subscriptions.$\r$\n$\r$\nClick Next to continue."
  !insertmacro MUI_PAGE_WELCOME
!macroend

!macro customFinishPage
  !define MUI_FINISHPAGE_TITLE "HexBrief is ready"
  !define MUI_FINISHPAGE_TEXT "Installed successfully.$\r$\n$\r$\nOpen it each morning for your daily brief."
  !define MUI_FINISHPAGE_RUN "$INSTDIR\HexBrief.exe"
  !define MUI_FINISHPAGE_RUN_TEXT "Launch HexBrief now"
  !insertmacro MUI_PAGE_FINISH
!macroend

!macro customInstall
  WriteRegStr HKCU "Software\HexBrief" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\HexBrief" "Version" "${VERSION}"
!macroend

!macro customUnInstall
  DetailPrint "Closing HexBrief if running..."
  nsProcess::_FindProcess "HexBrief.exe"
  Pop $R0
  ${If} $R0 == 0
    nsProcess::_KillProcess "HexBrief.exe"
    Sleep 1000
  ${EndIf}

  DetailPrint "Removing app data..."
  RMDir /r "$APPDATA\HexBrief"
  RMDir /r "$LOCALAPPDATA\HexBrief"
  RMDir /r "$LOCALAPPDATA\Programs\HexBrief"

  DetailPrint "Removing shortcuts..."
  Delete "$DESKTOP\HexBrief.lnk"
  Delete "$QUICKLAUNCH\HexBrief.lnk"
  Delete "$STARTMENU\Programs\HexBrief\HexBrief.lnk"
  RMDir "$STARTMENU\Programs\HexBrief"
  Delete "$SMSTARTUP\HexBrief.lnk"

  DetailPrint "Cleaning registry..."
  DeleteRegKey HKCU "Software\HexBrief"
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "HexBrief"

  DetailPrint "HexBrief has been completely removed."
!macroend
