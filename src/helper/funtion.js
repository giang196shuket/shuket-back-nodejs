const userModel = require("../model/user");

async function mergeRoleList(arr1, arr2, hasPer = true) {
  list = [];
  cateLv1 = {};
  cateLv2 = {};

  for (r of arr1) {
    if (arr2.includes(r.U_CATE_CODE)) {
      r.HAS_PER = hasPer;
    } else {
      r.HAS_PER = !hasPer;
    }

    if (r.U_CATE_DEPT === 3) {
      if (!cateLv2.hasOwnProperty(r.U_CATE_PCD)) {
        row2 = await userModel.select_prog_by_code(r.U_CATE_PCD);
        if (row2) {
          cateLv2[r.U_CATE_PCD] = row2;
        }
      } else {
        row2 = cateLv2[r.U_CATE_PCD];
      }
      if (row2) {
        if (!cateLv1.hasOwnProperty(row2.U_CATE_PCD)) {
          row1 = await userModel.select_prog_by_code(row2.U_CATE_PCD);
          if (row1) {
            cateLv1[row2.U_CATE_PCD] = row1;
          }
        } else {
          row1 = cateLv1[row2.U_CATE_PCD];
        }
        if (!list[row1.U_CATE_CODE]) {
          list[row1.U_CATE_CODE] = {
            group_code: row1.U_CATE_CODE,
            group_route: row1.URL,
            group_sort: row1.SORT_ORDER,
            group_names: {
              vn: row1.U_CATE_NAME,
              en: row1.U_CATE_NAME_EN,
              kr: row1.U_CATE_NAME_KR,
            },
          };
        }
        if (list[row1.U_CATE_CODE].items[row2.U_CATE_CODE] !== undefined) {
          list[row1.U_CATE_CODE].items[row2.U_CATE_CODE] = {
            code: row2.U_CATE_CODE,
            route: row2.URL,
            sort2: row2.SORT_ORDER,
            name: {
              vn: row2.U_CATE_NAME,
              en: row2.U_CATE_NAME_EN,
              kr: row2.U_CATE_NAME_KR,
            },
          };
        }

        if (
          !list[row1.U_CATE_CODE].items[row2.U_CATE_CODE].items[r.U_CATE_CODE]
        ) {
          list[row1.U_CATE_CODE].items[row2.U_CATE_CODE].items[r.U_CATE_CODE] =
            [];
        }

        list[row1.U_CATE_CODE].items[row2.U_CATE_CODE].items[r.U_CATE_CODE].push({
          code: r.U_CATE_CODE,
          route: r.URL,
          sort3: r.SORT_ORDER,
          names: {
            vn: r.U_CATE_NAME,
            en: r.U_CATE_NAME_EN,
            kr: r.U_CATE_NAME_KR,
          },
          chk_flag: r.HAS_PER,
        });
      }
    } else if (r.U_CATE_DEPT === 2) {
      if (!cateLv1.hasOwnProperty(r.U_CATE_PCD)) {
        row1 = await userModel.select_prog_by_code(r.U_CATE_PCD);
        if (row1) {
          cateLv1[r.U_CATE_PCD] = row1;
        }
      } else {
        row1 = cateLv1[r.U_CATE_PCD];
      }
      if (!list[row1.U_CATE_CODE]) {
        list[row1.U_CATE_CODE] = {
          code: row1.U_CATE_CODE,
          route: row1.URL,
          sort: row1.SORT_ORDER,
          names: {
            vn: row1.U_CATE_NAME,
            en: row1.U_CATE_NAME_EN,
            kr: row1.U_CATE_NAME_KR,
          },
        };
      }

      if (!list[row1.U_CATE_CODE].items[r.U_CATE_CODE]) {
        list[row1.U_CATE_CODE].items[r.U_CATE_CODE] = {
          code: r.U_CATE_CODE,
          route: r.URL,
          sort2: r.SORT_ORDER,
          name: {
            vn: r.U_CATE_NAME,
            en: r.U_CATE_NAME_EN,
            kr: r.U_CATE_NAME_KR,
          },
          chk_flag: r.HAS_PER,
        };
      }
    } else {
      list[r.U_CATE_CODE] = {
        code: r.U_CATE_CODE,
        route: r.URL,
        sort: r.SORT_ORDER,
        names: {
          vn: r.U_CATE_NAME,
          en: r.U_CATE_NAME_EN,
          kr: r.U_CATE_NAME_KR,
        },
        chk_flag: r.HAS_PER,
      };
    }
  }

  listProgs = [];
  a = b = c = 0;

  for (r1 of list) {
    b = c = 0;
    listProgs[a] = {
      group_code: r1.code,
      group_route: r1.route,
      group_sort: r1.sort,
      group_names: r1.names,
    };

    if (r1.chk_flag !== undefined) {
      listProgs[a].chk_flag = r1.chk_flag;
    }

    if (r1.items && r1.items.length > 0) {
      for (r2 of r1.items) {
        c = 0;
        listProgs[a].group_items[b] = {
          code: r2.code,
          route: r2.route,
          sort2: r2.sort2,
          name: r2.name,
        };
        if (r2.chk_flag !== undefined) {
          listProgs[a].group_items[b.chk_flag] = r2.chk_flag;
        }
        if (r2.items && r2.items.length > 0) {
          for (r3 of r2.items) {
            c = 0;
            listProgs[a].group_items[b].sub_items[c] = {
              code: r3.code,
              route: r3.route,
              sort3: r3.sort,
              name: r3.name,
            };
            if (r3.chk_flag !== undefined) {
              listProgs[a].group_items[b].sub_items[c].chk_flag = r3.chk_flag;
            }
            c++;
          }
          listProgs[a].group_items[b].sub_items.sort(
            (item1, item2) => item1.sort3 - item2.sort3
          );
        }
        b++;
      }
      listProgs[a].group_items.sort(
        (item1, item2) => item1.sort3 - item2.sort3
      );
    }
    a++;
  }
}

module.exports = { mergeRoleList };
