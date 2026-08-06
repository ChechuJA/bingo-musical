Imports Microsoft.Office.Interop

Public Class Form1

    Private Sub cmdGenerar_Click(sender As System.Object, e As System.EventArgs) Handles cmdGenerar.Click
        Dim strLineas As String()
        Dim intContCanciones As Integer
        Dim strElegidos As String
        Dim intNum As Integer
        Dim rdnNumero As New Random()

        strLineas = IO.File.ReadAllLines(txtOrigen.Text, System.Text.Encoding.Default)

        If Mid(txtDestino.Text, txtDestino.Text.Length, 1) <> "\" Then
            txtDestino.Text = txtDestino.Text & "\"
        End If

        If IO.File.Exists(txtDestino.Text & "carton.xlsx") Then
            IO.File.Delete(txtDestino.Text & "carton.xlsx")
        End If
        For intCont = 1 To nudCantidad.Value
            strElegidos = vbNullString
            For intContCanciones = 1 To 12

                intNum = rdnNumero.Next(0, strLineas.Length)

                Do While InStr(strElegidos, strLineas(intNum)) <> 0
                    intNum = rdnNumero.Next(0, strLineas.Length)
                Loop

                strElegidos = strElegidos & strLineas(intNum) & vbCrLf

            Next
            CreaCarton(strElegidos, intCont)
        Next

        MsgBox("terminado")

    End Sub

    Private Sub CreaCarton(ByVal strElegidos As String, ByVal intCont As Integer)
        Dim objExcel As Excel.Application
        Dim objBook As Excel.Workbook
        Dim oSheet As Excel.Worksheet
        Dim strNombreFichero As String
        Dim intContador As Integer
        Dim ptInicio As Integer

        If intCont = 1 Then
            ptInicio = 1

            'ElseIf intCont = 2 Then
            '   ptInicio = 11
        Else
            ptInicio = (intCont - 1) * 10 + 1

        End If

        objExcel = New Excel.Application()

        If IO.File.Exists(txtDestino.Text & "carton.xlsx") Then
            objBook = objExcel.Workbooks.Open(txtDestino.Text & "carton.xlsx")
        Else

            objBook = objExcel.Workbooks.Add
        End If
            oSheet = objBook.Worksheets(1)

        oSheet.Range("A" & ptInicio).Value = Split(strElegidos, vbCrLf)(0)
            oSheet.Range("C" & ptInicio).Value = Split(strElegidos, vbCrLf)(1)
            oSheet.Range("E" & ptInicio).Value = Split(strElegidos, vbCrLf)(2)

            ptInicio = ptInicio + 2
        oSheet.Range("A" & ptInicio).Value = Split(strElegidos, vbCrLf)(3)
            oSheet.Range("C" & ptInicio).Value = Split(strElegidos, vbCrLf)(4)
            oSheet.Range("E" & ptInicio).Value = Split(strElegidos, vbCrLf)(5)

            ptInicio = ptInicio + 2
            oSheet.Range("A" & ptInicio).Value = Split(strElegidos, vbCrLf)(6)
            oSheet.Range("C" & ptInicio).Value = Split(strElegidos, vbCrLf)(7)
            oSheet.Range("E" & ptInicio).Value = Split(strElegidos, vbCrLf)(8)

            ptInicio = ptInicio + 2
            oSheet.Range("A" & ptInicio).Value = Split(strElegidos, vbCrLf)(9)
            oSheet.Range("C" & ptInicio).Value = Split(strElegidos, vbCrLf)(10)
            oSheet.Range("E" & ptInicio).Value = Split(strElegidos, vbCrLf)(11)

            intContador = 1

            objExcel.DisplayAlerts = False
            strNombreFichero = "carton.xlsx"
            objBook.SaveAs(txtDestino.Text & strNombreFichero)
            objBook.Close()
            objExcel.Quit()

            oSheet = Nothing
            objBook = Nothing
            objExcel = Nothing

    End Sub

    Private Sub Form1_Load(sender As System.Object, e As System.EventArgs) Handles MyBase.Load
        txtOrigen.Text = My.Application.Info.DirectoryPath & "\Canciones.txt"
        txtDestino.Text = My.Application.Info.DirectoryPath & "\Destino\"
    End Sub
End Class
