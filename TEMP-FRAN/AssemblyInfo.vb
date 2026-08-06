<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()> _
Partial Class Form1
    Inherits System.Windows.Forms.Form

    'Form reemplaza a Dispose para limpiar la lista de componentes.
    <System.Diagnostics.DebuggerNonUserCode()> _
    Protected Overrides Sub Dispose(ByVal disposing As Boolean)
        Try
            If disposing AndAlso components IsNot Nothing Then
                components.Dispose()
            End If
        Finally
            MyBase.Dispose(disposing)
        End Try
    End Sub

    'Requerido por el Diseñador de Windows Forms
    Private components As System.ComponentModel.IContainer

    'NOTA: el Diseñador de Windows Forms necesita el siguiente procedimiento
    'Se puede modificar usando el Diseñador de Windows Forms.  
    'No lo modifique con el editor de código.
    <System.Diagnostics.DebuggerStepThrough()> _
    Private Sub InitializeComponent()
        Me.cmdGenerar = New System.Windows.Forms.Button()
        Me.lblOrigen = New System.Windows.Forms.Label()
        Me.txtOrigen = New System.Windows.Forms.TextBox()
        Me.txtDestino = New System.Windows.Forms.TextBox()
        Me.lblDestino = New System.Windows.Forms.Label()
        Me.lblCantidad = New System.Windows.Forms.Label()
        Me.nudCantidad = New System.Windows.Forms.NumericUpDown()
        CType(Me.nudCantidad, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.SuspendLayout()
        '
        'cmdGenerar
        '
        Me.cmdGenerar.Location = New System.Drawing.Point(686, 12)
        Me.cmdGenerar.Name = "cmdGenerar"
        Me.cmdGenerar.Size = New System.Drawing.Size(69, 34)
        Me.cmdGenerar.TabIndex = 0
        Me.cmdGenerar.Text = "Generar"
        Me.cmdGenerar.UseVisualStyleBackColor = True
        '
        'lblOrigen
        '
        Me.lblOrigen.AutoSize = True
        Me.lblOrigen.Location = New System.Drawing.Point(12, 9)
        Me.lblOrigen.Name = "lblOrigen"
        Me.lblOrigen.Size = New System.Drawing.Size(76, 13)
        Me.lblOrigen.TabIndex = 1
        Me.lblOrigen.Text = "Fichero Origen"
        '
        'txtOrigen
        '
        Me.txtOrigen.Location = New System.Drawing.Point(94, 6)
        Me.txtOrigen.Name = "txtOrigen"
        Me.txtOrigen.Size = New System.Drawing.Size(574, 20)
        Me.txtOrigen.TabIndex = 2
        '
        'txtDestino
        '
        Me.txtDestino.Location = New System.Drawing.Point(94, 44)
        Me.txtDestino.Name = "txtDestino"
        Me.txtDestino.Size = New System.Drawing.Size(574, 20)
        Me.txtDestino.TabIndex = 4
        '
        'lblDestino
        '
        Me.lblDestino.AutoSize = True
        Me.lblDestino.Location = New System.Drawing.Point(12, 47)
        Me.lblDestino.Name = "lblDestino"
        Me.lblDestino.Size = New System.Drawing.Size(43, 13)
        Me.lblDestino.TabIndex = 3
        Me.lblDestino.Text = "Destino"
        '
        'lblCantidad
        '
        Me.lblCantidad.AutoSize = True
        Me.lblCantidad.Location = New System.Drawing.Point(12, 92)
        Me.lblCantidad.Name = "lblCantidad"
        Me.lblCantidad.Size = New System.Drawing.Size(49, 13)
        Me.lblCantidad.TabIndex = 5
        Me.lblCantidad.Text = "Cantidad"
        '
        'nudCantidad
        '
        Me.nudCantidad.Location = New System.Drawing.Point(94, 85)
        Me.nudCantidad.Name = "nudCantidad"
        Me.nudCantidad.Size = New System.Drawing.Size(59, 20)
        Me.nudCantidad.TabIndex = 7
        '
        'Form1
        '
        Me.AutoScaleDimensions = New System.Drawing.SizeF(6.0!, 13.0!)
        Me.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font
        Me.ClientSize = New System.Drawing.Size(767, 184)
        Me.Controls.Add(Me.nudCantidad)
        Me.Controls.Add(Me.lblCantidad)
        Me.Controls.Add(Me.txtDestino)
        Me.Controls.Add(Me.lblDestino)
        Me.Controls.Add(Me.txtOrigen)
        Me.Controls.Add(Me.lblOrigen)
        Me.Controls.Add(Me.cmdGenerar)
        Me.Name = "Form1"
        Me.Text = "Crear cartones Bingo Musical"
        CType(Me.nudCantidad, System.ComponentModel.ISupportInitialize).EndInit()
        Me.ResumeLayout(False)
        Me.PerformLayout()

    End Sub
    Friend WithEvents cmdGenerar As System.Windows.Forms.Button
    Friend WithEvents lblOrigen As System.Windows.Forms.Label
    Friend WithEvents txtOrigen As System.Windows.Forms.TextBox
    Friend WithEvents txtDestino As System.Windows.Forms.TextBox
    Friend WithEvents lblDestino As System.Windows.Forms.Label
    Friend WithEvents lblCantidad As System.Windows.Forms.Label
    Friend WithEvents nudCantidad As System.Windows.Forms.NumericUpDown

End Class
