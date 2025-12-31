import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KENDO_TREEVIEW } from '@progress/kendo-angular-treeview';
import { Right, UserService } from 'dist/@rosoftlab/core';
import { Observable, map, of, shareReplay } from 'rxjs';
export interface MenuItemDto {
  id: string;
  parentId?: string | null;
  name: string;
  order?: number | null;

  // whatever else you have:
  pagePath?: string;
  icon?: string;
  isMenu?: boolean;
  rightKey?: string;
  resourceName?: string;
  color?: string;
}

export type RightTreeNode = Right & { items?: RightTreeNode[] };
/**
 * Build hierarchical tree from a flat list using parentId.
 * Sorts siblings by `order` (and name as a stable fallback).
 */
export function buildRightsTree(flat: Right[]): RightTreeNode[] {
  const nodes = (flat ?? []) as RightTreeNode[];

  // Ensure a clean items[] every time (avoid duplicates if rebuild)
  for (const n of nodes) {
    n.items = [];
  }

  const byId = new Map<string, RightTreeNode>();
  for (const n of nodes) {
    // IMPORTANT: use the accessor/property, not _id
    byId.set(String(n.id), n);
  }

  const roots: RightTreeNode[] = [];

  for (const n of nodes) {
    const parentId = n.parentId;

    const hasParent = parentId !== undefined && parentId !== null && parentId !== '' && byId.has(String(parentId));

    if (hasParent) {
      byId.get(String(parentId))!.items!.push(n);
    } else {
      roots.push(n);
    }
  }

  const sortRecursive = (arr: RightTreeNode[]) => {
    arr.sort((a, b) => {
      const ao = a.order ?? 0;
      const bo = b.order ?? 0;
      if (ao !== bo) return ao - bo;
      return String(a.name ?? '').localeCompare(String(b.name ?? ''));
    });

    for (const n of arr) {
      if (n.items?.length) sortRecursive(n.items);
    }
  };

  sortRecursive(roots);
  return roots;
}
@Component({
  selector: 'app-role-form',
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.scss'],
  imports: [CommonModule, FormsModule, KENDO_TREEVIEW],
})
export class RoleFormComponent implements OnInit {
  public checkedKeys: string[] = [];
  public nodes$!: Observable<RightTreeNode[]>;
  private selectedKeys$!: Observable<string[]>;
  public vm$!: Observable<RightTreeNode[]>;
  constructor(private userService: UserService) {}
  ngOnInit() {
    this.nodes$ = this.userService.getRights().pipe(
      map((r) => buildRightsTree(r.getModels())),
      shareReplay(1)
    );

    // this.selectedKeys$ = this.http.get<MenuItemDto[]>('/api/role-rights-selected').pipe(
    //   map((selected) => selected.map((x) => x.id)),
    //   shareReplay(1)
    // );

    // this.vm$ = combineLatest([this.nodes$, this.selectedKeys$]).pipe(
    //   tap(([, keys]) => (this.checkedKeys = keys)),
    //   map(([nodes]) => nodes),
    //   shareReplay(1)
    // );
  }

  public onCheckedKeysChange(keys: string[]): void {
    this.checkedKeys = keys;

    // Persist as ids (recommended, stable):
    // this.http.post('/api/role-rights', { ids: keys }).subscribe();
  }

  // Kendo calls this for each node to determine checkbox state
  public isChecked = (_: any, item: RightTreeNode) => this.getNodeCheckState(item);

  private getNodeCheckState(item: RightTreeNode): 'checked' | 'indeterminate' | 'none' {
    const checked = new Set(this.checkedKeys);

    const children = item.items ?? [];
    const selfChecked = checked.has(item.id);

    if (children.length === 0) {
      return selfChecked ? 'checked' : 'none';
    }

    // When checkParents/checkChildren are enabled, the UI should show indeterminate
    // if some descendants are checked but not all.
    let checkedCount = 0;
    let indeterminateFound = false;

    for (const c of children) {
      const state = this.getNodeCheckState(c);
      if (state === 'indeterminate') indeterminateFound = true;
      if (state === 'checked') checkedCount++;
    }

    if (checkedCount === children.length && !indeterminateFound) {
      // all descendants fully checked -> checked
      return 'checked';
    }

    if (checkedCount > 0 || indeterminateFound || selfChecked) {
      // some descendants checked OR node itself checked -> indeterminate
      // (keeps UI consistent even if backend returns parent ids)
      return 'indeterminate';
    }

    return 'none';
  }
  public hasChildren = (item: RightTreeNode): boolean => {
    return Array.isArray(item.items) && item.items.length > 0;
  };
  public fetchChildren = (node: RightTreeNode): Observable<RightTreeNode[]> => {
    return of(node.items ?? []);
  };
}
