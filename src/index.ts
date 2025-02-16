import $ from 'jquery';
import { bitable } from '@lark-base-open/js-sdk';
import './index.scss';
import jsPDF from 'jspdf';
import pdfmake from 'pdfmake/build/pdfmake';
import pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Receipt } from './receipt';
// import './locales/i18n'; // 开启国际化，详情请看README.md


$(async function() {
  const [tableList, selection] = await Promise.all([bitable.base.getTableMetaList(), bitable.base.getSelection()]);
  const optionsHtml = tableList.map(table => {
    return `<option value="${table.id}">${table.name}</option>`;
  }).join('');
  $('#tableSelect').append(optionsHtml).val(selection.tableId!);
  $('#addRecord').on('click', async function() {
    const tableId = $('#tableSelect').val();
    if (tableId) {
      const table = await bitable.base.getTableById(tableId as string);
      const sel = await bitable.base.getSelection();
      //const fields = await table.getFieldMetaList()
      let finalPrint: string = '';
      let allAnswers: any[] = [];

      const studentNameField = await table.getFieldByName('Tên Học Viên');
      const parentNameField = await table.getFieldByName('Tên Phụ Huynh');
      const classField = await table.getFieldByName('Lớp Hiện tại');
      const shiftField = await table.getFieldByName('Ca học');
      const tuitionFeeField = await table.getFieldByName('Số Tiền Phải Đóng Theo Lớp');
      const totalField = await table.getFieldByName('Tổng tiền tạm tính');

      let receipt = {} as Receipt;
      var studentNamePromise = await table.getCellString(sel.recordId!, studentNameField.id)
        .then(cellStr => receipt.studentName = cellStr);
      var parentNamePromise = await table.getCellString(sel.recordId!, parentNameField.id)
        .then(cellStr => receipt.parentName = cellStr);;
      var classPromise = await table.getCellString(sel.recordId!, classField.id)
        .then(cellStr => receipt.class = cellStr);
      var shiftPromise = await table.getCellString(sel.recordId!, shiftField.id)
        .then(cellStr => receipt.shift = cellStr);
      var tuitionFeePromise = await table.getCellString(sel.recordId!, tuitionFeeField.id)
        .then(cellStr => receipt.tuitionFees = cellStr);
      var totalPromise = await table.getCellString(sel.recordId!, totalField.id)
        .then(cellStr => receipt.total = cellStr);


      Promise.all(allAnswers).then(() => downloadFile([studentNamePromise,
                                                      parentNamePromise,
                                                      classPromise,
                                                      shiftPromise,
                                                      tuitionFeePromise,
                                                      totalPromise], 'test.pdf'));
    }
  });

});

function downloadFile(data: string, fileName: string) {
  /*pdf.text(text, 10, 10);
  const newBlob = new Blob([pdf.output()], { type: "application/pdf" });
  const data = window.URL.createObjectURL(newBlob);
  const link = document.createElement("a");
  link.href = data;
  link.download = fileName; // set a name for the file
  link.click();
  */

  var dd: TDocumentDefinitions = {
    content: [
      {
        columns: [
          {
            width: 60,
            text: "Image goes here"

          },
          [
            'CÔNG TY TNHH GIÁO DỤC & TƯ VẤN FUN WITH ENGLISH',
            '63/6/6 TRƯƠNG PHƯỚC PHAN, P.BÌNH TRỊ ĐÔNG, Q.BÌNH TÂN',
            'Hotline : 0888.259.390'
          ]
        ]
      },
      {
        text: '\nPhiếu thu học phí:    Tháng 12/2023\n\n',
        style: 'header'
      },
      {
        columns: [
          {
            text: 'Họ & tên:',
            width: 100
          },
          {
            text: '[STUDENT_NAME]',
            style: 'fieldValue',
            width: "*",
            marginLeft: 30
          },
        ]
      },
      {
        columns: [
          {
            text: 'Tên PH:',
            width: 100,
          },
          {
            text: '[PARENT_NAME]',
            style: 'fieldValue',
            width: "*",
            marginLeft: 30
          },
        ],

      },
      {
        alignment: 'justify',
        columns: [
          {
            columns: [
              {
                text: 'Lớp:',
                width: 25

              },
              {
                text: '[CLASS]',
                style: 'fieldValue',
                width: "*",
                marginLeft: 10
              },
            ],
          },
          {
            columns: [
              {
                text: 'Ca học:',
                width: 40

              },
              {
                text: '[SHIFT]',
                style: 'fieldValue',
                width: "*",
                marginLeft: 10
              },
            ],
          },
          {
            columns: [
              {
                text: 'Giờ học:',
                width: 50

              },
              {
                text: '[TIME_START]',
                style: 'fieldValue',
                width: "*",
                marginLeft: 10
              },
            ],
          }

        ]

      },
      {
        columns: [
          {
            text: 'Học phí:',
            width: 100,
          },
          {
            text: '[TUITION_FEES]',
            style: 'fieldValue',
            width: "*",
            marginLeft: 30
          },
        ],

      },
      {
        columns: [
          {
            text: 'Tiền sách:',
            width: 100,
          },
          {
            text: '[MATERIAL_FEES]',
            style: 'fieldValue',
            width: "*",
            marginLeft: 30
          },
        ],

      },
      {
        columns: [
          {
            text: 'Giảm trừ:',
            width: 100,
          },
          {
            text: '[DEDUCTIONS]',
            style: 'fieldValue',
            width: "*",
            marginLeft: 30
          },
        ],

      },
      {
        columns: [
          {
            text: 'Tổng',
            width: 100,
          },
          {
            text: '[TOTAL]',
            style: 'fieldValue',
            width: "*",
            marginLeft: 30
          },
        ],

      },
      {
        columns: [
          {
            text: 'Ghi chú:',
            width: 100,
          },
          {
            text: '[NOTES]',
            style: 'fieldValue',
            width: "*",
            marginLeft: 30
          },
        ],

      },
      '\n',
      {
        columns: [
          {
            text: 'Xác nhận của PH',
            width: "*",
          },
          {
            text: 'Xác nhận của TT',
            width: "*",
          },
        ],
      }

    ],
    styles: {
      fieldValue: {
        bold: true,
        lineHeight: 1.5
      },
      header: {
        fontSize: 17
      }
    }

  }

  pdfmake.vfs = pdfFonts.vfs;
  var pdfDoc = pdfmake.createPdf(dd).download('test.pdf');
}