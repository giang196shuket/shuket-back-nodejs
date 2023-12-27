const userModel = require("../model/user");

async function mergeRoleList(arr1, arr2, hasPer = true) {
  list = {};
  cate_lv1 = {};
  cate_lv2 = {};
  for (let r of arr1) {
    // Kiểm tra xem giá trị mảng role user có trong mảng role level không
    if (arr2.includes(r.U_CATE_CODE)) {
      r.HAS_PER = hasPer;
    } else {
      r.HAS_PER = !hasPer;
    }
    if (r.U_CATE_DEPT === 3) {
      // nếu độ sâu phân lớp là 3
      if (!(r.U_CATE_PCD in cate_lv2)) {
        // Khóa không tồn tại trong cate_lv2
        row2 = await userModel.selectProgByCode(r.U_CATE_PCD);
        if (row2) {
          cate_lv2[r.U_CATE_PCD] = row2;
        }
      } else {
        // Khóa  tồn tại trong cate_lv2
        row2 = cate_lv2[r.U_CATE_PCD];
      }
      if (row2) {
        if (!(row2.U_CATE_PCD in cate_lv1)) {
          // Khóa không tồn tại trong cate_lv2
          row1 = await userModel.selectProgByCode(row2.U_CATE_PCD);
          if (row1) {
            cate_lv1[row2.U_CATE_PCD] = row1;
          } else {
            row1 = cate_lv1[row2.U_CATE_PCD];
          }
          if (!list.hasOwnProperty(row1.U_CATE_CODE)) {
            //kiểm tra khác undefined ko
            list[row1.U_CATE_CODE] = {
              code: row1.U_CATE_CODE,
              names: {
                vn: row1.U_CATE_NAME,
                en: row1.U_CATE_NAME_EN,
                kr: row1.U_CATE_NAME_KR,
              },
            };
          }
          //kiểm tra độ sâu 1
          if (list[row1.U_CATE_CODE]) {
            list[row1.U_CATE_CODE] = { ...list[row1.U_CATE_CODE], items: {} };
          }

          // gán độ sâu 1
          if (list[row1.U_CATE_CODE].items[row2.U_CATE_CODE] == undefined) {
            list[row1.U_CATE_CODE].items[row2.U_CATE_CODE] = {
              code: row2.U_CATE_CODE,
              names: {
                vn: row2.U_CATE_NAME,
                en: row2.U_CATE_NAME_EN,
                kr: row2.U_CATE_NAME_KR,
              },
            };
          }
          //kiểm tra độ sâu 2

          if (list[row1.U_CATE_CODE].items[row2.U_CATE_CODE]) {
            list[row1.U_CATE_CODE].items[row2.U_CATE_CODE] = {
              ...list[row1.U_CATE_CODE].items[row2.U_CATE_CODE],
              items: {},
            };
          }
          // gán độ sâu 2
          if (
            list[row1.U_CATE_CODE].items[row2.U_CATE_CODE].items[
              r.U_CATE_CODE
            ] == undefined
          ) {
            list[row1.U_CATE_CODE].items[row2.U_CATE_CODE].items[
              r.U_CATE_CODE
            ] = {
              code: r.U_CATE_CODE,
              names: {
                vn: r.U_CATE_NAME,
                en: r.U_CATE_NAME_EN,
                kr: r.U_CATE_NAME_KR,
              },
              chk_flag: r.HAS_PER,
            };
          }
        }
      }
    } else if (r.U_CATE_DEPT === 2) {
      // nếu độ sâu phân lớp là 2
      if (!(r.U_CATE_PCD in cate_lv1)) {
        // Khóa không tồn tại trong cate_lv1
        r1 = await userModel.selectProgByCode(r.U_CATE_PCD);
        if (r1) {
          cate_lv1[r1.U_CATE_PCD] = r1;
        }
      } else {
        // Khóa  tồn tại trong cate_lv2
        r1 = cate_lv1[r.U_CATE_PCD];
      }
      if (!list.hasOwnProperty(r1.U_CATE_CODE)) {
        //kiểm tra khác undefined ko
        list[r1.U_CATE_CODE] = {
          code: r1.U_CATE_CODE,
          names: {
            vn: r1.U_CATE_NAME,
            en: r1.U_CATE_NAME_EN,
            kr: r1.U_CATE_NAME_KR,
          },
        };
      }
      //kiểm tra độ sâu 1
      if (list[r1.U_CATE_CODE]) {
        list[r1.U_CATE_CODE] = { ...list[r1.U_CATE_CODE], items: {} };
      }

      // gán độ sâu 1
      if (list[r1.U_CATE_CODE].items[r.U_CATE_CODE] == undefined) {
        list[r1.U_CATE_CODE].items[r.U_CATE_CODE] = {
          code: r.U_CATE_CODE,
          names: {
            vn: r.U_CATE_NAME,
            en: r.U_CATE_NAME_EN,
            kr: r.U_CATE_NAME_KR,
          },
          chk_flag: r.HAS_PER,
        };
      }
    } else {
      // nếu độ sâu phân lớp là 1
      list[r.U_CATE_CODE] = {
        code: r.U_CATE_CODE,
        names: {
          vn: r.U_CATE_NAME,
          en: r.U_CATE_NAME_EN,
          kr: r.U_CATE_NAME_KR,
        },
        chk_flag: r.HAS_PER,
      };
    }
  }

  list_progs = [];
  let a = b = c = 0;

  return list;
}

module.exports = { mergeRoleList };
