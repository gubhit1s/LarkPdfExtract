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

      const studentNameField = await table.getFieldByName('Tên Học Viên');
      const parentNameField = await table.getFieldByName('Tên Phụ Huynh');
      const classField = await table.getFieldByName('Lớp Hiện Tại');
      const shiftField = await table.getFieldByName('Ca Học');
      const tuitionFeeField = await table.getFieldByName('Số Tiền Phải Đóng Theo Lớp');
      const totalField = await table.getFieldByName('Tổng Tiền Tạm Tính');
      const noteField = await table.getFieldByName('Ghi Chú');

      let receipt = {} as Receipt;
      let studentNamePromise = await table.getCellString(studentNameField.id, sel.recordId!)
        .then(cellStr => receipt.studentName = cellStr.toUpperCase());
      let parentNamePromise = await table.getCellString(parentNameField.id, sel.recordId!)
        .then(cellStr => receipt.parentName = cellStr.toUpperCase());;
      let classPromise = await table.getCellString(classField.id, sel.recordId!)
        .then(cellStr => receipt.class = cellStr.toUpperCase());
      let shiftPromise = await table.getCellString(shiftField.id, sel.recordId!)
        .then(cellStr => receipt.shift = cellStr.toUpperCase());
      let tuitionFeePromise = await table.getCellString(tuitionFeeField.id, sel.recordId!)
        .then(cellStr => receipt.tuitionFees = cellStr.toUpperCase());
      let totalPromise = await table.getCellString(totalField.id, sel.recordId!)
        .then(cellStr => receipt.total = cellStr.toUpperCase());
      let notePromise = await table.getCellString(noteField.id, sel.recordId!)
        .then(cellStr => receipt.notes = cellStr.toUpperCase());

      let allPromises = [studentNamePromise, parentNamePromise, classPromise, shiftPromise, tuitionFeePromise, totalPromise, notePromise];

      Promise.all(allPromises).then(() => downloadFile(receipt, 'test.pdf'));
    }
  });

});

function downloadFile(data: Receipt, fileName: string) {
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
            image: 'data:image/jpeg;base64,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',

          },
          [
            {
              text: 'CÔNG TY TNHH GIÁO DỤC & TƯ VẤN FUN WITH ENGLISH',
              marginLeft: 10
            },
            {
              text: '63/6/6 TRƯƠNG PHƯỚC PHAN, P.BÌNH TRỊ ĐÔNG, Q.BÌNH TÂN',
              marginLeft: 10
            },
            {
              text: 'Hotline : 0888.259.390',
              marginLeft: 10
            }
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
            width: 100,
            style: 'rowStyle'
          },
          {
            text: data.studentName,
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
            style: 'rowStyle'
          },
          {
            text: data.parentName,
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
                width: 25,
                style: 'rowStyle'

              },
              {
                text: data.class,
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
                text: data.shift,
                style: 'fieldValue',
                width: "*",
                marginLeft: 10
              },
            ],
          },
          // {
          //   columns: [
          //     {
          //       text: 'Giờ học:',
          //       width: 50

          //     },
          //     {
          //       text: '[TIME_START]',
          //       style: 'fieldValue',
          //       width: "*",
          //       marginLeft: 10
          //     },
          //   ],
          // }

        ]

      },
      {
        columns: [
          {
            text: 'Học phí:',
            width: 100,
            style: 'rowStyle'
          },
          {
            text: data.tuitionFees,
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
            style: 'rowStyle'
          },
          {
            text: data.materialFees,
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
            style: 'rowStyle'
          },
          {
            text: data.deductions,
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
            style: 'rowStyle'
          },
          {
            text: data.total,
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
            style: 'rowStyle'
          },
          {
            text: data.notes,
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
      },
      header: {
        fontSize: 17
      },
      rowStyle: {
        lineHeight: 1.5
      }
    }

  }

  pdfmake.vfs = pdfFonts.vfs;
  var pdfDoc = pdfmake.createPdf(dd).download('test.pdf');
}